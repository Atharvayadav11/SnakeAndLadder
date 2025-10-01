import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { StartGameDto } from 'src/dto/startGame.dto';

@WebSocketGateway({ cors: true })
export class GameGateway {
  @WebSocketServer()
  server: Server;
  constructor(private gameService: GameService) { }

  @SubscribeMessage('startGame')
  handleGameStart(@MessageBody() data: StartGameDto, client: Socket) {
    try {
      this.gameService.onStartGame(data.playerId, data.roomId);
      this.server.to(data.roomId).emit('gameStarted', { playerId: data.playerId, roomId: data.roomId });
    } catch (error) {
      client.emit('gameStartError', { message: error.message });
    }
  }

  @SubscribeMessage('rollDice')
  handleDiceRoll(@MessageBody() data: StartGameDto, client: Socket) {
    try {
      const val = this.gameService.onRollDice(data.playerId, data.roomId);

      const state = this.gameService.getGameState(data.roomId);
      this.server.to(data.roomId).emit('diceRolled', { playerId: data.playerId, val });

      if (state?.isGameFinished && state.winner) {
        this.server.to(data.roomId).emit("gameWon", { playerId: data.playerId, roomId: data.roomId });
      }

    } catch (error) {
      client.emit('rollDiceError', { message: error.message });
    }
  }

}

