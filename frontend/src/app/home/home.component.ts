import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
import { SocketService } from '../services/socket.services';


@Component({
  selector: 'app-home',
  imports: [
    FormsModule, 
    MatButtonModule, 
    MatInputModule, 
    MatCardModule, 
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    CommonModule,
    MatSnackBarModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  roomId: string = '';
  playerName: string = '';
  currentRoomId: string = '';
  players: string[] = [];
  message: string = '';
  isInRoom: boolean = false;
  selectedAction: 'none' | 'create' | 'join' = 'none';
  isLoading: boolean = false;
  loadingMessage: string = '';
  showOverlay: boolean = false;
  availableColors: string[] = [];
  selectedColor: string | null = null;
  isPickingColor: boolean = false;
  isAdmin: boolean = false;



  private socketService = inject(SocketService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  ngOnInit() {

    this.socketService.currentRoomId$.subscribe(id => this.currentRoomId = id);
    this.socketService.players$.subscribe(players => this.players = players);
    this.socketService.isInRoom$.subscribe(v => this.isInRoom = v);
    this.socketService.availableColors$.subscribe(c => this.availableColors = c);
    this.socketService.selectedColor$.subscribe(sc => this.selectedColor = sc);

    // Navigate everyone when the server announces game start
    this.socketService.onGameStarted().subscribe((payload: any) => {
      const id = payload?.roomId || this.currentRoomId;
      if (id) {
        this.router.navigate(['/game', id]);
      }
    });

    this.socketService.onRoomCreated().subscribe((data: any) => {
      this.isLoading = false;
      this.showOverlay = true;
      this.message = `Room created successfully. ID: ${data.roomId}`;
      this.snackBar.open(`Room created. ID: ${data.roomId}`, 'Close', { duration: 3000 });
      console.log('Room created:', data);
      this.isPickingColor = true;
      this.isAdmin = !!data.isAdmin;
    });

  
    this.socketService.onRoomJoined().subscribe((data: any) => {
      this.isLoading = false;
      this.selectedAction = 'none';
      this.showOverlay = true;
      this.message = `Successfully joined room ${data.roomId}`;
      this.snackBar.open(`Joined room ${data.roomId}`, 'Close', { duration: 3000 });
      console.log('Joined room:', data);
      this.isPickingColor = true;
      this.isAdmin = !!data.isAdmin;
    });

    this.socketService.onPlayerJoined().subscribe((data: any) => {
      if (data.playerName !== this.playerName) {
        this.message = `${data.playerName} joined the room`;
        this.snackBar.open(`${data.playerName} joined the room`, 'Close', { duration: 3000 });
        setTimeout(() => this.message = '', 3000);
      }
      console.log('Player joined:', data);
    });
  
    this.socketService.onError().subscribe((error: any) => {
      this.isLoading = false;
      this.message = `Error: ${error.message}`;
      this.snackBar.open(`Error: ${error.message}`, 'Close', { duration: 3500, panelClass: 'snack-error' });
      console.error('Socket error:', error);
    });

    this.socketService.onAvailableColors().subscribe((payload: any) => {
      this.availableColors = payload.colors || [];
    });

    this.socketService.onColorSelected().subscribe((payload: any) => {
      if (payload.playerId === (window as any)?.socket?.id) {
        this.selectedColor = payload.color;
      }
    });

    this.socketService.onGameStarted().subscribe((data: any) => {
      this.isLoading = false;
      this.isInRoom = true;
      this.showOverlay = true;
      this.message = `Game started`;
    });
  }

  onNameEntered() {
    if (this.playerName.trim()) {
      this.message = '';
    }
  }

  pickCreate() {
    this.selectedAction = 'create';
    this.message = '';
    this.showOverlay = true;
  }

  pickJoin() {
    this.selectedAction = 'join';
    this.message = '';
    this.showOverlay = true;
  }

  goBack() {
    this.selectedAction = 'none';
    this.roomId = '';
    this.message = '';
    this.showOverlay = false;
    this.isPickingColor = false;
  }

  createRoom() {
    if (!this.playerName.trim()) {
      this.message = 'Please enter your name';
      return;
    }
    if (!this.roomId.trim()) {
      this.message = 'Please enter a room ID';
      return;
    }
    this.isLoading = true;
    this.loadingMessage = 'Creating your room...';
    this.message = '';
    this.socketService.createRoom(this.playerName, this.roomId.trim());
  }

  joinRoom() {
    if (!this.playerName.trim()) {
      this.message = 'Please enter your name';
      return;
    }
    if (!this.roomId.trim()) {
      this.message = 'Please enter room code';
      return;
    }
    this.isLoading = true;
    this.loadingMessage = 'Joining room...';
    this.message = '';
    this.socketService.joinRoom(this.roomId, this.playerName);
  }

  chooseColor(color: string) {
    if (!this.currentRoomId) return;
    this.selectedColor = color;
    this.socketService.selectColor(this.currentRoomId, color);
    this.isPickingColor = false;
  }

  closeOverlay() {
    this.showOverlay = false;
  }

  onCloseCard() {
    if (this.isPickingColor) {
      this.isPickingColor = false;
      return;
    }
    if (this.isInRoom && this.currentRoomId) {
      this.leaveRoom();
      return;
    }
    this.goBack();
  }

  onStartGame() {
    const roomId = this.socketService.getCurrentRoomId();
    const playerId = this.socketService.getSocketId();
    if (roomId) {
      this.socketService.startGame(roomId, playerId);
    }
  }

  leaveRoom() {
    this.socketService.leaveRoom();
    this.isPickingColor = false;
    this.showOverlay = false;
    this.selectedAction = 'none';
    this.message = '';
  }




}
