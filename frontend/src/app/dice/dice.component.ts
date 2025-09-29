import { Component, inject, signal, effect } from '@angular/core';
import { SocketService } from '../services/socket.services';

@Component({
  selector: 'app-dice',
  templateUrl: './dice.component.html',
  styleUrls: ['./dice.component.scss']
})
export class DiceComponent {
  private socketService = inject(SocketService);

  diceValue = this.socketService.diceValue; // signal from service
  rolling = signal(false);                  // local animation state

  constructor() {
    // React when diceValue changes
    effect(() => {
      const val = this.diceValue();
      if (val > 0) {
        this.rolling.set(true); // start animation
        setTimeout(() => {
          this.rolling.set(false); // stop animation after duration
        }, 700); // must match your CSS transition/animation time
      }
    });
  }

  rollDice() {
    this.socketService.rollDice(); // just trigger server roll
  }
}
