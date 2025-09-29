import { createServer } from "http";
import { Server } from "socket.io";
import { RoomsService } from '../rooms/rooms.service';
import { GameService } from "src/game/game.service";
import { GameModel } from "src/game/game.model";


export async function setupSocket(app: any, roomsService: RoomsService, gameService: GameService) {
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:4200"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('createRoom', (data) => {
      console.log('Creating room for player:', data.playerName);
      const room = roomsService.createRoom(data.playerName);
      socket.join(room.id);
      socket.emit('roomCreated', { roomId: room.id, room: room });
      console.log('Room created:', room.id);
    });

    socket.on('joinRoom', (data) => {
      const { roomId, playerName } = data;
      console.log('Player', playerName, 'trying to join room:', roomId);
      const room = roomsService.joinRoom(roomId, playerName);
      if (!room) {
        socket.emit('error', { message: 'Room does not exist' });
        console.log('Room not found:', roomId);
        return;
      }
      socket.join(roomId);
      socket.emit('joinedRoom', { roomId: roomId, room: room });
      io.to(roomId).emit('playerJoined', { playerName: playerName, players: room.players });
      console.log('Player joined room:', roomId, 'Players:', room.players);
    });

    socket.on('rollDice',(data: GameModel) => {
      let val = gameService.rollDice(data.playerId);
      io.to(data.roomId).emit("diceRolled", {val, playerId: data.playerId});
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return { httpServer, io };
}