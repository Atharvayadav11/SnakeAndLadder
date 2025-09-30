import { UserModel } from "../models/user";
import { GameStateModel } from "../models/gameState";

export interface GameModel{
    playerId: string,
    roomId: string
}

export interface Player {
    id: string;
    name: string;
    position: number;
    isActive: boolean;
}




export interface Snake {
    head: number;
    tail: number;
}

export interface Ladder {
    bottom: number;
    top: number;
}