import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from '../services/socket.services';
import { UserService } from '../services/users.service';

@Component({
  selector: 'app-dice',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dice-container">
      <div class="dice-display" [class.rolling]="isRolling()">
        <div class="dice-face" *ngIf="diceValue(); else placeholder">
          <div class="dice-dots">
            @switch (diceValue()) {
              @case (1) {
                <span class="dot center"></span>
              }
              @case (2) {
                <span class="dot top-left"></span>
                <span class="dot bottom-right"></span>
              }
              @case (3) {
                <span class="dot top-left"></span>
                <span class="dot center"></span>
                <span class="dot bottom-right"></span>
              }
              @case (4) {
                <span class="dot top-left"></span>
                <span class="dot top-right"></span>
                <span class="dot bottom-left"></span>
                <span class="dot bottom-right"></span>
              }
              @case (5) {
                <span class="dot top-left"></span>
                <span class="dot top-right"></span>
                <span class="dot center"></span>
                <span class="dot bottom-left"></span>
                <span class="dot bottom-right"></span>
              }
              @case (6) {
                <span class="dot top-left"></span>
                <span class="dot top-right"></span>
                <span class="dot middle-left"></span>
                <span class="dot middle-right"></span>
                <span class="dot bottom-left"></span>
                <span class="dot bottom-right"></span>
              }
            }
          </div>
        </div>
        <ng-template #placeholder>
          <div class="dice-placeholder">?</div>
        </ng-template>
      </div>

      <button 
        class="roll-button" 
        (click)="rollDice()"
        [disabled]="!canRoll()"
        [class.disabled]="!canRoll()">
        {{ buttonText() }}
      </button>

      <div class="turn-info" *ngIf="currentPlayer()">
        <p class="current-turn">
          Current Turn: <strong>{{ currentPlayerName() }}</strong>
        </p>
        <p class="your-turn" *ngIf="isYourTurn()">
          🎲 It's your turn!
        </p>
      </div>
    </div>
  `,
  styles: [`
    .dice-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .dice-display {
      width: 100px;
      height: 100px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease;
    }

    .dice-display.rolling {
      animation: roll 0.5s ease-in-out;
    }

    @keyframes roll {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(90deg) scale(1.1); }
      50% { transform: rotate(180deg) scale(1.2); }
      75% { transform: rotate(270deg) scale(1.1); }
    }

    .dice-face {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .dice-dots {
      width: 75%;
      height: 75%;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      padding: 8px;
      position: relative;
    }

    .dot {
      width: 12px;
      height: 12px;
      background: #333;
      border-radius: 50%;
      position: absolute;
    }

    .dot.top-left { top: 12px; left: 12px; }
    .dot.top-right { top: 12px; right: 12px; }
    .dot.middle-left { top: 50%; left: 12px; transform: translateY(-50%); }
    .dot.middle-right { top: 50%; right: 12px; transform: translateY(-50%); }
    .dot.bottom-left { bottom: 12px; left: 12px; }
    .dot.bottom-right { bottom: 12px; right: 12px; }
    .dot.center { 
      top: 50%; 
      left: 50%; 
      transform: translate(-50%, -50%); 
    }

    .dice-placeholder {
      font-size: 32px;
      font-weight: bold;
      color: #999;
    }

    .roll-button {
      padding: 12px 24px;
      font-size: 16px;
      font-weight: bold;
      color: white;
      background: linear-gradient(145deg, #4CAF50, #45a049);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .roll-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
    }

    .roll-button:active:not(:disabled) {
      transform: translateY(0);
    }

    .roll-button:disabled,
    .roll-button.disabled {
      background: #ccc;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .turn-info {
      text-align: center;
      margin-top: 1rem;
    }

    .current-turn {
      font-size: 14px;
      color: #666;
      margin: 0;
    }

    .your-turn {
      font-size: 16px;
      color: #4CAF50;
      font-weight: bold;
      margin: 0.5rem 0 0;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `]
})
export class DiceComponent {
  private socketService = inject(SocketService);
  private userService = inject(UserService);

  diceValue = this.socketService.diceValue;
  currentPlayer = this.socketService.currentUser;
  isRolling = computed(() => false);

  canRoll = computed(() => {
    const localUser = this.userService.localUser();
    const currentUser = this.currentPlayer();
    return localUser && currentUser && localUser === currentUser;
  });

  isYourTurn = computed(() => {
    return this.canRoll();
  });

  buttonText = computed(() => {
    if (this.canRoll()) {
      return 'Roll Dice';
    }
    return 'Wait for turn';
  });

  currentPlayerName = computed(() => {
    const currentPlayerId = this.currentPlayer();
    if (!currentPlayerId) return 'Unknown';

    const user = this.socketService.getUser(currentPlayerId);
    return user?.name || currentPlayerId;
  });

  rollDice() {
    if (!this.canRoll()) {
      console.log('Not your turn!');
      return;
    }

    console.log('Rolling dice...');
    this.socketService.rollDice();
  }
}