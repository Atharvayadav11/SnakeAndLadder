// import { createServer } from "http";
// import { Server } from "socket.io";
// import { RoomsService } from '../rooms/rooms.service';
// import { GameService } from "src/game/game.service";
// import { GameModel } from "src/game/game.model";


// export async function setupSocket(app: any, roomsService: RoomsService, gameService: GameService) {
// 



//   const ladderVals: [number, number][] = [[5, 58], [42, 60], [14, 49], [53, 72], [64, 83], [75, 94]];
//   const snakeVals: [number, number][] = [[38, 20], [45, 7], [51, 10], [65, 54], [97, 61], [91, 73]];

//   const GameState = new Map<string, GameState>();
//   const ladder = new Map<number, number>(ladderVals);
//   const snakes = new Map<number, number>(snakeVals);


//   const colors = ['red', 'blue', 'green', 'yellow'];
//   const httpServer = createServer(app);
//   const io = new Server(httpServer, {
//     cors: {
//       origin: ["http://localhost:4200"],
//       methods: ["GET", "POST", "PUT", "DELETE"],
//       credentials: true
//     }
//   });

//   function serializeGameState(gameState: GameState) {
//     return {
//       ...gameState,
//       Users: Object.fromEntries(gameState.Users), // Map → plain object
//     };
//   }

//   io.on('connection', (socket) => {
//     console.log('Client connected:', socket.id);

//     socket.on('createRoom', (data) => {
//       console.log('Creating room for player:', data.playerName);
//       try {
//         const room = roomsService.createRoom(data.playerName, data.roomId);
//         socket.join(room.id);
//         const User: User = {
//           name: data.playerName,
//           color: '',
//           currentPosition: 0,
//           isAnAdmin: true,
//           isActive: true
//         }
//         GameState.set(room.id, {
//           Users: new Map<string, User>([[socket.id, User]]),
//           winner: '',
//           currentUserToPlay: socket.id,
//           isGameStarted: false,
//           isGameFinished: false,
//           usersInQueue: [socket.id],
//           maxUsers: 4
//         });

//         const obj = Object.fromEntries(GameState.get(room.id)?.Users ?? []);
//         console.log("Om", obj);

//         socket.emit('roomCreated', { roomId: room.id, room: room, gameState: obj, isAdmin: true, isGameStarted: false });
//         // send available colors to creator
//         socket.emit('availableColors', { roomId: room.id, colors });
//         console.log('Room created:', room.id);

//         console.log('GameState:', GameState);
//         console.log(GameState.get(room.id)?.Users)
//       } catch (e: any) {
//         socket.emit('error', { message: e?.message || 'Failed to create room' });
//       }
//     });

//     socket.on('joinRoom', (data) => {
//       const { roomId, playerName } = data;
//       console.log('Player', playerName, 'trying to join room:', roomId);
//       if (!GameState.has(roomId)) {
//         socket.emit('gameState', { gameState: GameState.get(roomId) });
//         socket.emit('error', { message: 'Room does not exist' });
//         console.log('Room not found:', roomId);

//         return;
//       }

//       if (GameState.get(roomId)?.maxUsers === GameState.get(roomId)?.usersInQueue.length) {

//         socket.emit('error', { message: 'Room is full' });
//         console.log('Room is full:', roomId);
//         return;
//       }
//       const room = roomsService.joinRoom(roomId, playerName);
//       if (!room) {
//         socket.emit('error', { message: 'Room does not exist' });
//         console.log('Room not found:', roomId);
//         return;
//       }


//       const obj = Object.fromEntries(GameState.get(room.id)?.Users ?? []);
//       console.log("Om", obj);
//       const currUser = GameState.get(roomId)?.usersInQueue[0];
//       socket.join(roomId);
//       socket.emit('joinedRoom', { roomId: roomId, room: room, currentUser: currUser, joinedUser: socket.id, gameState: obj, isAdmin: false, isGameStarted: GameState.get(roomId)?.isGameStarted || false });

//       const User: User = {
//         name: playerName,
//         color: '',
//         currentPosition: 0,
//         isAnAdmin: false,
//         isActive: true
//       }
//       const existingState = GameState.get(roomId);
//       const usersInQueue = existingState?.usersInQueue || [];
//       const usersMap = new Map<string, User>(existingState?.Users || []);
//       usersMap.set(socket.id, User);
//       GameState.set(roomId, {
//         Users: usersMap,
//         winner: existingState?.winner || '',
//         currentUserToPlay: existingState?.currentUserToPlay || '',
//         isGameStarted: existingState?.isGameStarted || false,
//         isGameFinished: existingState?.isGameFinished || false,
//         usersInQueue: [...usersInQueue, socket.id],
//         maxUsers: existingState?.maxUsers || 4
//       });
//       // compute available colors based on taken colors in room
//       const takenColors = Array.from(usersMap.values())
//         .map(u => u.color)
//         .filter(c => !!c);
//       const available = colors.filter(c => !takenColors.includes(c));
//       socket.emit('availableColors', { roomId, colors: available });
//       io.to(roomId).emit('playerJoined', { playerName: playerName, players: room.players });
//       console.log('Player joined room:', roomId, 'Players:', room.players);

//       console.log('GameState:', GameState);
//       console.log(GameState.get(roomId)?.Users)
//     });

//     // Player selects a color
//     socket.on('selectColor', (data: { roomId: string, color: string }) => {
//       const { roomId, color } = data;
//       const state = GameState.get(roomId);
//       if (!state) {
//         socket.emit('error', { message: 'Room does not exist' });
//         return;
//       }
//       const usersMap = new Map<string, User>(state.Users || []);
//       const takenColors = Array.from(usersMap.values())
//         .map(u => u.color)
//         .filter(c => !!c);
//       if (!colors.includes(color)) {
//         socket.emit('error', { message: 'Invalid color selection' });
//         return;
//       }
//       if (takenColors.includes(color)) {
//         socket.emit('error', { message: 'Color already taken' });
//         return;
//       }
//       const user = usersMap.get(socket.id);
//       if (!user) {
//         socket.emit('error', { message: 'User not in room' });
//         return;
//       }
//       usersMap.set(socket.id, { ...user, color });
//       GameState.set(roomId, { ...state, Users: usersMap });
//       const available = colors.filter(c => c !== color && !Array.from(usersMap.values()).some(u => u.color === c));
//       io.to(roomId).emit('colorSelected', { playerId: socket.id, color });
//       io.to(roomId).emit('availableColors', { roomId, colors: available });
//     });

//     socket.on('rollDice', (data: GameModel) => {
//       const { playerId, roomId } = data;

//       let val = Math.floor(Math.random() * 6) + 1;
//       let state = GameState.get(roomId);

//       if (val != 6) {
//         let queue = state?.usersInQueue;
//         let first = queue?.shift();
//         queue?.push(first || "");
//         state?.usersInQueue != queue;
//         state?.currentUserToPlay != queue![0];
//       }

//       GameState.set(roomId, state!);
//       io.to(roomId).emit("diceRolled", { playerId, val, GameData: serializeGameState(GameState.get(roomId)!) });

//       // Move Player
//       const room = GameState.get(roomId);
//       console.log("dice" + room)
//       const player = room!.Users.get(playerId);

//       // Start of Game
//       if (player?.currentPosition === 0 && val != 6)
//         return;

//       let nextPos = player!.currentPosition + val;
//       if (ladder.has(nextPos)) {
//         nextPos = ladder.get(nextPos)!;
//       }
//       else if (snakes.has(nextPos)) {
//         nextPos = snakes.get(nextPos)!;
//       }

//       player!.currentPosition = nextPos;
//       room!.Users.set(playerId, player!);
//       GameState.set(roomId, room!);
//     });

//     socket.on('startGame', (payload: { roomId: string, playerId: string }) => {
//       const { roomId, playerId } = payload;
//       const gameState = GameState.get(roomId);
//       if (gameState && gameState.Users.get(playerId)?.isActive && gameState.Users.get(playerId)?.isAnAdmin) {
//         gameState.isGameStarted = true;
//         GameState.set(roomId, gameState);
//         const players = roomsService.getPlayers(roomId);
//         io.to(roomId).emit('gameStarted', { roomId, players });
//       } else {
//         socket.emit('error', { message: 'You are not an admin or you are not active player' });
//       }
//     })

//     socket.on('userDisconnected', (data) => {
//       const { roomId } = data;
//       console.log('Client disconnected:', socket.id);
//       const gameState = GameState.get(roomId);
//       if (gameState) {
//         gameState.usersInQueue = gameState.usersInQueue.filter(id => id !== socket.id);
//         const usersMap = new Map<string, User>(gameState.Users || []);
//         usersMap.delete(socket.id);
//         GameState.set(roomId, { ...gameState, Users: usersMap });
//         const takenColors = Array.from(usersMap.values()).map(u => u.color).filter(c => !!c);
//         const available = colors.filter(c => !takenColors.includes(c));
//         io.to(roomId).emit('availableColors', { roomId, colors: available });
//       }
//       console.log('GameState:', GameState);
//     });
//   });

//   return { httpServer, io };
// }

import { Injectable } from "@nestjs/common";
import { WebSocketServer } from "@nestjs/websockets/decorators/gateway-server.decorator";
import { Server, Socket } from "socket.io";


@Injectable()export class SocketService {

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  const GameState = new Map<string, GameState>();
  const ladderVals: [number, number][] = [[5, 58], [42, 60], [14, 49], [53, 72], [64, 83], [75, 94]];
  const snakeVals: [number, number][] = [[38, 20], [45, 7], [51, 10], [65, 54], [97, 61], [91, 73]];

  const ladder = new Map<number, number>(ladderVals);
  const snakes = new Map<number, number>(snakeVals);


  setServer(server:Server){
    this.server=server;
  }    



  emitToAll(event:string, data:any){
    this.server.emit(event,data);

  }

  emitToRoom(roomId:string,event:string,data:any){
    this.server.to(roomId).emit(event,data);
  }

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('createRoom', (data) => {
      console.log('Creating room for player:', data.playerName);
      try {
        const room = roomsService.createRoom(data.playerName, data.roomId);
        socket.join(room.id);
        const User: User = {
          name: data.playerName,
          color: '',
          currentPosition: 0,
          isAnAdmin: true,
          isActive: true
        }
        GameState.set(room.id, {
          Users: new Map<string, User>([[socket.id, User]]),
          winner: '',
          currentUserToPlay: socket.id,
          isGameStarted: false,
          isGameFinished: false,
          usersInQueue: [socket.id],
          maxUsers: 4
        });

        const obj = Object.fromEntries(GameState.get(room.id)?.Users ?? []);
        console.log("Om", obj);

        socket.emit('roomCreated', { roomId: room.id, room: room, gameState: obj, isAdmin: true, isGameStarted: false });
        // send available colors to creator
        socket.emit('availableColors', { roomId: room.id, colors });
        console.log('Room created:', room.id);

        console.log('GameState:', GameState);
        console.log(GameState.get(room.id)?.Users)
      } catch (e: any) {
        socket.emit('error', { message: e?.message || 'Failed to create room' });
      }
    });

    socket.on('joinRoom', (data) => {
      const { roomId, playerName } = data;
      console.log('Player', playerName, 'trying to join room:', roomId);
      if (!GameState.has(roomId)) {
        socket.emit('gameState', { gameState: GameState.get(roomId) });
        socket.emit('error', { message: 'Room does not exist' });
        console.log('Room not found:', roomId);

        return;
      }

      if (GameState.get(roomId)?.maxUsers === GameState.get(roomId)?.usersInQueue.length) {

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


      const obj = Object.fromEntries(GameState.get(room.id)?.Users ?? []);
      console.log("Om", obj);
      const currUser = GameState.get(roomId)?.usersInQueue[0];
      socket.join(roomId);
      socket.emit('joinedRoom', { roomId: roomId, room: room, currentUser: currUser, joinedUser: socket.id, gameState: obj, isAdmin: false, isGameStarted: GameState.get(roomId)?.isGameStarted || false });

      const User: User = {
        name: playerName,
        color: '',
        currentPosition: 0,
        isAnAdmin: false,
        isActive: true
      }
      const existingState = GameState.get(roomId);
      const usersInQueue = existingState?.usersInQueue || [];
      const usersMap = new Map<string, User>(existingState?.Users || []);
      usersMap.set(socket.id, User);
      GameState.set(roomId, {
        Users: usersMap,
        winner: existingState?.winner || '',
        currentUserToPlay: existingState?.currentUserToPlay || '',
        isGameStarted: existingState?.isGameStarted || false,
        isGameFinished: existingState?.isGameFinished || false,
        usersInQueue: [...usersInQueue, socket.id],
        maxUsers: existingState?.maxUsers || 4
      });
      // compute available colors based on taken colors in room
      const takenColors = Array.from(usersMap.values())
        .map(u => u.color)
        .filter(c => !!c);
      const available = colors.filter(c => !takenColors.includes(c));
      socket.emit('availableColors', { roomId, colors: available });
      io.to(roomId).emit('playerJoined', { playerName: playerName, players: room.players });
      console.log('Player joined room:', roomId, 'Players:', room.players);

      console.log('GameState:', GameState);
      console.log(GameState.get(roomId)?.Users)
    });

    // Player selects a color
    socket.on('selectColor', (data: { roomId: string, color: string }) => {
      const { roomId, color } = data;
      const state = GameState.get(roomId);
      if (!state) {
        socket.emit('error', { message: 'Room does not exist' });
        return;
      }
      const usersMap = new Map<string, User>(state.Users || []);
      const takenColors = Array.from(usersMap.values())
        .map(u => u.color)
        .filter(c => !!c);
      if (!colors.includes(color)) {
        socket.emit('error', { message: 'Invalid color selection' });
        return;
      }
      if (takenColors.includes(color)) {
        socket.emit('error', { message: 'Color already taken' });
        return;
      }
      const user = usersMap.get(socket.id);
      if (!user) {
        socket.emit('error', { message: 'User not in room' });
        return;
      }
      usersMap.set(socket.id, { ...user, color });
      GameState.set(roomId, { ...state, Users: usersMap });
      const available = colors.filter(c => c !== color && !Array.from(usersMap.values()).some(u => u.color === c));
      io.to(roomId).emit('colorSelected', { playerId: socket.id, color });
      io.to(roomId).emit('availableColors', { roomId, colors: available });
    });

    socket.on('rollDice', (data: GameModel) => {
      const { playerId, roomId } = data;

      let val = Math.floor(Math.random() * 6) + 1;
      let state = GameState.get(roomId);

      if (val != 6) {
        let queue = state?.usersInQueue;
        let first = queue?.shift();
        queue?.push(first || "");
        state?.usersInQueue != queue;
        state?.currentUserToPlay != queue![0];
      }

      const room = GameState.get(roomId);
      console.log("dice" + room)
      const player = room!.Users.get(playerId);
  
      GameState.set(roomId, state!);
      io.to(roomId).emit("diceRolled", { playerId, val, GameData: serializeGameState(GameState.get(roomId)!) });

      if (player?.currentPosition === 0 && val != 6)
        return;

      let nextPos = player!.currentPosition + val;
      if (ladder.has(nextPos)) {
        nextPos = ladder.get(nextPos)!;
      }
      else if (snakes.has(nextPos)) {
        nextPos = snakes.get(nextPos)!;
      }

      player!.currentPosition = nextPos;
      room!.Users.set(playerId, player!);
      GameState.set(roomId, room!);
    });

    socket.on('startGame', (payload: { roomId: string, playerId: string }) => {
      const { roomId, playerId } = payload;
      const gameState = GameState.get(roomId);
      if (gameState && gameState.Users.get(playerId)?.isActive && gameState.Users.get(playerId)?.isAnAdmin) {
        gameState.isGameStarted = true;
        GameState.set(roomId, gameState);
        const players = roomsService.getPlayers(roomId);
        io.to(roomId).emit('gameStarted', { roomId, players });
      } else {
        socket.emit('error', { message: 'You are not an admin or you are not active player' });
      }
    })

    socket.on('userDisconnected', (data) => {
      const { roomId } = data;
      console.log('Client disconnected:', socket.id);
      const gameState = GameState.get(roomId);
      if (gameState) {
        gameState.usersInQueue = gameState.usersInQueue.filter(id => id !== socket.id);
        const usersMap = new Map<string, User>(gameState.Users || []);
        usersMap.delete(socket.id);
        GameState.set(roomId, { ...gameState, Users: usersMap });
        const takenColors = Array.from(usersMap.values()).map(u => u.color).filter(c => !!c);
        const available = colors.filter(c => !takenColors.includes(c));
        io.to(roomId).emit('availableColors', { roomId, colors: available });
      }
      console.log('GameState:', GameState);
    });
  });

  return { httpServer, io };
