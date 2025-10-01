import { inject, Injectable, signal } from "@angular/core";
import { SocketService } from "../services/socket.services";
import { HomeService } from "../home/home.services";
import { BoardService } from "../board/board.services";

@Injectable({ providedIn: 'root' })
export class DiceService {
    diceValue = signal(1);
    constructor(private socketService: SocketService, private userService: HomeService, private boardService: BoardService) {
        // Listen Dice Roll
        this.socketService.on<{ playerId: string; val: number }>('diceRolled')
            .subscribe(({ playerId, val }) => {
                this.setDiceValue(val);
                this.boardService.movePlayer(playerId, val);
        });
    }

    rollDice() {
        this.socketService.emit('rollDice', { playerId: this.userService.localUser(), roomId: this.userService.roomId() });
    }

    setDiceValue(val: number) {
        this.diceValue.set(val);
    }
}