import { Injectable } from "@nestjs/common";    

import { v4 as uuidv4 } from 'uuid';
import { GameService } from "src/game/game.service";
import { UserModel } from '../models/user';
import { GameStateModel } from "../models/gameState";

@Injectable()
export class RoomsService {
  

    constructor(private gameService:GameService){}

getRoomById(id: string):any {
        const gameState = this.gameService.getGameState(id);
    }

createRoom(playerName: string, customId?: string, userId?: string): GameStateModel {
        const roomId = (customId && customId.trim().length > 0) ? customId.trim() : uuidv4();
if(this.gameService.getGameState(roomId)){
    throw new Error('Room with this ID already exists');
}

   const newRoom: GameStateModel = {
    Users: userId ? new Map<string, UserModel>([
        [userId, {
            id: userId,
            name: playerName,
            color: '',
            currentPosition: 0,
            isAnAdmin: true,
            isActive: true
        } as UserModel]
    ]) : new Map<string, UserModel>(),
    maxUsers: 4,
    isGameStarted: false,
    isGameFinished: false,
    currentUserToPlay: '',
    winner: '',
    usersInQueue: [],
    availableColors: ["red", "blue", "green", "yellow"]
   }
   this.gameService['gameState'].set(roomId,newRoom);
        return newRoom;
    }

joinRoom(roomId: string, playerName: string,userId:string): GameStateModel | null {
        const room = this.gameService.getGameState(roomId);
        if (!room) return null;
        if (room.Users.size >= room.maxUsers) {
            throw new Error('Room is full');
        }
        const newUser: UserModel = {
            name: playerName,
            color: '',
            currentPosition: 0,
            isAnAdmin: false,
            isActive: true
        };
       room.Users.set(userId,newUser);
       room.usersInQueue.push(userId);
        return room;
    }

selectColor(roomId: any, playerId: any, color: any): GameStateModel | null {   
        const room = this.gameService.getGameState(roomId);
        if (!room) {
            throw new Error('Room not found');
        }
        if (!room.availableColors.includes(color)) {
            throw new Error('Color not available');
        }
        const user = room.Users.get(playerId);
        if (!user) {
            throw new Error('User not found in room');
        }
        user.color = color;
        room.availableColors = room.availableColors.filter(c => c !== color);
        room.Users.set(playerId, user);
        this.gameService['gameState'].set(roomId, room);
        return room;
    }


handleUserDisconnect(roomId: string, playerId: string): GameStateModel | null {
        const room = this.gameService.getGameState(roomId);
        if (!room) return null;
        const user = room.Users.get(playerId);
        if (user) {
            user.isActive = false;
            room.Users.set(playerId, user);
            room.availableColors.push(user.color);
            user.color = '';
        }
        this.gameService['gameState'].set(roomId, room);
        return room;
    }

}