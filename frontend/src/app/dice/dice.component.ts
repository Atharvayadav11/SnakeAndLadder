import { Component, inject } from '@angular/core';
import { SocketService } from '../services/socket.services';

@Component({
  selector: 'app-dice',
  imports: [],
  templateUrl: './dice.component.html',
  styleUrl: './dice.component.scss'
})
export class DiceComponent {
  currentRoll = 1;
  isEvenRoll = true;

  rollDice() {
    // this.isEvenRoll = !this.isEvenRoll;
    this.currentRoll = this.getRandomNumber(1, 6);
  }

  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
