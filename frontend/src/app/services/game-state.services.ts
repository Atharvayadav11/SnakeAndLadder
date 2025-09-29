import { inject, Injectable, signal } from "@angular/core";
import { SocketService } from "./socket.services";

@Injectable({providedIn: 'root'})
export class GameService{
    private socketService = inject(SocketService);
    private readonly playerId = "123";
    isPlayerTurn = signal(false);

    setPlayerTurn(isTurn: boolean){
        this.isPlayerTurn.set(isTurn);
    }

    getPlayerId(){
        return this.playerId;
    }








    


    

    

    

}