import { Component, inject, signal, effect } from '@angular/core';
import { SocketService } from '../services/socket.services';

@Component({
  selector: 'app-dice',
  templateUrl: './dice.component.html',
  styleUrls: ['./dice.component.scss']
})
export class DiceComponent {
  private socketService = inject(SocketService);

  diceValue = this.socketService.diceValue;
  rolling = signal(false);                

  constructor() {
    effect(() => {
      const val = this.diceValue();
      if (val > 0) {
        this.rolling.set(true);
        setTimeout(() => {
          this.rolling.set(false);
        }, 700);
      }
    });
  }

  rollDice() {
    this.socketService.rollDice(); 
  }
}
