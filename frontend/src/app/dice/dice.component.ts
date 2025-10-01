import { Component, computed, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiceService } from './dice.service';
import { HomeService } from '../home/home.services';
import { BoardService } from '../board/board.services';

@Component({
  selector: 'app-dice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dice.component.html',
  styleUrls: ['./dice.component.scss']
})
export class DiceComponent {
  diceValue: Signal<number>;
  currentPlayer = signal(" ");

  constructor(private userService: HomeService, private boardService: BoardService, private diceService: DiceService){
    this.diceValue = this.diceService.diceValue;
    this.currentPlayer.set(this.boardService.getCurrentUser());
  }

  isRolling = computed(() => false);

  canRoll = computed(() => {
    const localUser = this.userService.localUser();
    const currentUser = this.boardService.getCurrentUser();
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
    const currentPlayerId = this.boardService.getCurrentUser();
    if (!currentPlayerId) return 'Unknown';

    const user = this.boardService.getUser(currentPlayerId);
    return user?.name || currentPlayerId;
  });

  rollDice() {
    if (!this.canRoll()) {
      console.log('Not your turn!');
      return;
    }
    console.log('Rolling dice');
    this.diceService.rollDice();
  }
}