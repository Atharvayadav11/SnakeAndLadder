import { Injectable } from "@nestjs/common";    

@Injectable()
export class GameService {
   rollDice(playerId: string){
    let val = Math.floor(Math.random()*6) + 1;
    
   }

   movePlayer(playerId: string, diceCount: number){

   }

   endGame(){

   }





}