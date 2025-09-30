import { WebSocketGateway, OnGatewayConnection, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({cors: true})
export class GameGateway implements OnGatewayConnection {
  @WebSocketServer()
  socket: Socket;

  constructor(private gameService: GameService){}
  handleConnection(client: Socket) {
    console.log('Player connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Player disconnected:', client.id);
  }

  @SubscribeMessage('startGame')
  handleGameStart(@MessageBody() data: {playerId: string, roomId: string}, client: Socket){
    try {
        const val = this.gameService.onStartGame(data.playerId, data.roomId);
        this.socket.to(data.roomId).emit('gameStarted', {playerId: data.playerId, roomId: data.roomId});
    } catch (error) {
        client.emit('gameStartError',{message: error.message});
    }
  }

  @SubscribeMessage('rollDice')
  handleDiceRoll(@MessageBody() data: {playerId: string, roomId: string}){
    const val = this.gameService.onRollDice(data.playerId, data.roomId);
    this.socket.to(data.roomId).emit('diceRolled', {playerId: data.playerId, val}); 
  }
  
}

