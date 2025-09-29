import { createServer } from "http";
import { Server } from "socket.io";
import { RoomsService } from '../rooms/rooms.service';
import { Inject } from "@nestjs/common";
import { GameService } from "src/game/game.service";
import { GameModel } from "src/game/game.model";


export async function setupSocket(app: any, roomsService: RoomsService, gameService: GameService) {
  
  interface User{
    name:string,
    color:string
    currentPosition:number,
    isAnAdmin:boolean,
    isActive:boolean
  }

  interface GameState{
    Users: Map<string,User>;
    winner:string;
    currentUserToPlay:string;
    isGameStarted:boolean;
    isGameFinished:boolean;
    maxUsers:number;
    usersInQueue:string[];
  }

  const GameState=new Map<string, GameState>();

  const colors=['red','blue','green','yellow'];
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
      const color = colors[GameState.get(room.id)?.usersInQueue.length || 0];
      const User:User={
        name: data.playerName,
        color: color,
        currentPosition: 0,
        isAnAdmin: true,
        isActive: true
      }
      GameState.set(room.id, {
        Users: new Map<string,User>([[socket.id, User]]),
        winner: '',
        currentUserToPlay: '',
        isGameStarted: false,
        isGameFinished: false,
        usersInQueue: [socket.id],
        maxUsers: 4
      });

      socket.emit('roomCreated', { roomId: room.id, room: room });
      console.log('Room created:', room.id);

      console.log('GameState:', GameState);
      console.log(GameState.get(room.id)?.Users)
    });

    socket.on('joinRoom', (data) => {
      const { roomId, playerName } = data;
      console.log('Player', playerName, 'trying to join room:', roomId);
      if(!GameState.has(roomId)){
        socket.emit('error', { message: 'Room does not exist' });
        console.log('Room not found:', roomId);
        return;       
      }

      const color = colors[GameState.get(roomId)?.usersInQueue.length || 0];
      if(GameState.get(roomId)?.maxUsers === GameState.get(roomId)?.usersInQueue.length){
        socket.emit('error', { message: 'Room is full' });
        console.log('Room is full:', roomId);
        return;
      }
      const room = roomsService.joinRoom(roomId, playerName);
      if (!room) {
        socket.emit('error', { message: 'Room does not exist' });
        console.log('Room not found:', roomId);
        return;
      }
      socket.join(roomId);
      socket.emit('joinedRoom', { roomId: roomId, room: room });

      const User:User={
        name: playerName,
        color: color,
        currentPosition: 0,
        isAnAdmin: false,
        isActive: true
      }
      const usersInQueue = GameState.get(roomId)?.usersInQueue || [];

        GameState.set(roomId, {
        Users: new Map<string,User>([[socket.id, User]]),
        winner: '',
        currentUserToPlay: '',
        isGameStarted: false,
        isGameFinished: false,
        usersInQueue: [...usersInQueue, socket.id],
        maxUsers: 4
      });
      io.to(roomId).emit('playerJoined', { playerName: playerName, players: room.players });
      console.log('Player joined room:', roomId, 'Players:', room.players);

      console.log('GameState:', GameState);
      console.log(GameState.get(roomId)?.Users)
    });

    socket.on('rollDice',(data: GameModel) => {
      gameService.rollDice(data.playerId)
    })

    socket.on('userDisconnected', (data) => {
      const { roomId } = data;
      console.log('Client disconnected:', socket.id);
      const gameState=GameState.get(roomId);
      if(gameState){
        gameState.usersInQueue=gameState.usersInQueue.filter(id=>id!==socket.id);
        GameState.set(roomId, gameState);
      }
console.log('GameState:', GameState);
    });


  });

  return { httpServer, io };
}