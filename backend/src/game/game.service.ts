import { Injectable } from "@nestjs/common";    
import { GameState } from "./game.model";

@Injectable()
export class GameService {

   private gameState: Map<string, GameState> = new Map();

 

   rollDice(playerId: string){
    let val = Math.floor(Math.random()*6) + 1;
    
   }

   movePlayer(playerId: string, diceCount: number){

   }

   endGame(){

   }





}