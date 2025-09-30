import { UserModel } from "./user"

 export interface GameStateModel {
    Users: Map<string, UserModel>;
    winner: string;
    currentUserToPlay: string;
    isGameStarted: boolean;
    isGameFinished: boolean;
    maxUsers: number;
    usersInQueue: string[];
    availableColors: string[];
  }