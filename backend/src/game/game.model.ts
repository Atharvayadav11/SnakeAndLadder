import { UserModel } from "../models/user";

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


export interface UserModel{
    name:string,
    color:string
    currentPosition:number,
    isAnAdmin:boolean,
    isActive:boolean
}

export interface GameState{
    users: Map<string, UserModel>;
    winner: string;
    currentUserToPlay: string;
    isGameStarted: boolean;
    isGameFinished: boolean;
    maxUsers: number;
    usersInQueue: string[];
    availableColors: ["red", "blue", "green", "yellow"];
}

export interface Snake {
    head: number;
    tail: number;
}

export interface Ladder {
    bottom: number;
    top: number;
}