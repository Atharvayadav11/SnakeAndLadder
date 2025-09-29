import { Injectable } from "@nestjs/common";    
import { Room } from './rooms.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RoomsService {
    private rooms: Record<string, Room> = {};

    createRoom(playerName: string, customId?: string): Room {
        const roomId = (customId && customId.trim().length > 0) ? customId.trim() : uuidv4();
        if (this.rooms[roomId]) {
            throw new Error('Room ID already exists');
        }
        const newRoom: Room = { id: roomId, players: [playerName] };
        this.rooms[roomId] = newRoom;
        return newRoom;
    }        
    
    joinRoom(roomId: string, playerName: string): Room | null {
        const room = this.rooms[roomId];
        if (!room) return null;
        room.players.push(playerName);
        return room;
    }

    getPlayers(id: string): string[] {
        return this.rooms[id]?.players || [];
    }

    getRoomById(id: string): Room | null {
        return this.rooms[id] || null;
    }
}