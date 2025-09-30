import { effect, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserService {
    localUser = signal("");
    roomId = signal("");

    setLocalUser(userId: string){
        this.localUser.set(userId);
    }

    setRoomId(roomId: string){
        this.roomId.set(roomId);
    }
}