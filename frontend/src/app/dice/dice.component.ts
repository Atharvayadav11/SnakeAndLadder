import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from '../services/socket.services';
import { UserService } from '../services/users.service';

@Component({
  selector: 'app-dice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dice.component.html',
  styleUrls: ['./dice.component.scss']
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