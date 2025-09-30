import { UserModel } from "./user.model";

export interface GameState{
    Users: Map<string,UserModel>;
    winner:string;
    currentUserToPlay:string;
    isGameStarted:boolean;
    isGameFinished:boolean;
    maxUsers:number;
    usersInQueue:string[];
}