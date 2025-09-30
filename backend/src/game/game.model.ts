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
    Users: Map<string,UserModel>;
    winner:string;
    currentUserToPlay:string;
    isGameStarted:boolean;
    isGameFinished:boolean;
    maxUsers:number;
    usersInQueue:string[];
}

export interface Snake {
    head: number;
    tail: number;
}

export interface Ladder {
    bottom: number;
    top: number;
}