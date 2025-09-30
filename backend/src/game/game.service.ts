import { Injectable } from "@nestjs/common";    
import {GameStateModel} from '../models/gameState'

@Injectable()
export class GameService {

   private gameState: Map<string, GameStateModel> = new Map();

 getGameState(roomId: string): GameStateModel{
    const state = this.gameState.get(roomId);
    if (!state) {
      throw new Error(`Game state not found for roomId: ${roomId}`);
    }
    return state;
   }

   rollDice(playerId: string){
    let val = Math.floor(Math.random()*6) + 1;
    
   }

   movePlayer(playerId: string, diceCount: number){

   }

   endGame(){

   }





}