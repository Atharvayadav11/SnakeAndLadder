// import { Injectable } from "@angular/core";
// import { BehaviorSubject } from "rxjs";

// @Injectable({ providedIn: 'root' })
// export class GameStateService {
//   playerName$ = new BehaviorSubject<string>('');
//   inputRoomId$ = new BehaviorSubject<string>('');
//   currentRoomId$ = new BehaviorSubject<string>('');
//   players$ = new BehaviorSubject<string[]>([]);
//   isInRoom$ = new BehaviorSubject<boolean>(false);
//   isPickingColor$ = new BehaviorSubject<boolean>(false);
//   availableColors$ = new BehaviorSubject<string[]>([]);
//   selectedColor$ = new BehaviorSubject<string | null>(null);
//   message$ = new BehaviorSubject<string>('');

//   setPlayerName(name: string) { this.playerName$.next(name); }
//   setInputRoomId(id: string) { this.inputRoomId$.next(id); }

//   setRoom(roomId: string, players: string[]) {
//     this.currentRoomId$.next(roomId);
//     this.players$.next(players);
//     this.isInRoom$.next(true);
//   }

//   clearRoom() {
//     this.currentRoomId$.next('');
//     this.players$.next([]);
//     this.isInRoom$.next(false);
//     this.isPickingColor$.next(false);
//     this.selectedColor$.next(null);
//   }

//   setAvailableColors(colors: string[]) { this.availableColors$.next(colors); }
//   setPickingColor(v: boolean) { this.isPickingColor$.next(v); }
//   setSelectedColor(c: string | null) { this.selectedColor$.next(c); }
//   setMessage(msg: string) { this.message$.next(msg); }
// }