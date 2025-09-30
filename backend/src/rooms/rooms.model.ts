import { UserModel } from '../models/user';

export interface Room {
   users: [];
   roomId: string;
   maxPlayers: number;
   isGameStarted: boolean;
   admin: string;
}