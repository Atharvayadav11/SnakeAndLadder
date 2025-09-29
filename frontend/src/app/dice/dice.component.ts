import { Component, inject } from '@angular/core';
import { SocketService } from '../services/socket.services';

@Component({
  selector: 'app-dice',
  imports: [],
  templateUrl: './dice.component.html',
  styleUrl: './dice.component.scss'
})
export class DiceComponent {
  private socketService = inject(SocketService);

  onDiceRoll(){
    this.socketService.rollDice();
  }
}
