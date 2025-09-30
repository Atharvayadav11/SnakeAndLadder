import { Socket } from "socket.io";
import { UserModel } from "../models/user.js";
import type { GameStateModel } from "../models/gameState.js";
import { Server } from "socket.io";
import { WebSocketServer,WebSocketGateway ,OnGatewayConnection,OnGatewayInit,OnGatewayDisconnect} from "@nestjs/websockets";
import { GameService } from "./game.service.js";

@WebSocketGateway({
    cors:{
        origin:'*'
    }
})
export class GameGateway {
   @WebSocketServer()
   Server:Server;

   constructor(private readonly gameService:GameService){}

   
}

