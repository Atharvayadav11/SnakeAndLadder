import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common'; 
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
    CommonModule
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
  showJoinForm: boolean = false;
  isLoading: boolean = false;
  loadingMessage: string = '';

  private socketService = inject(SocketService);

  ngOnInit() {
    
    this.socketService.onRoomCreated().subscribe((data: any) => {
      this.isLoading = false;
      this.currentRoomId = data.roomId;
      this.players = data.room.players;
      this.isInRoom = true;
      this.message = `Room created successfully. ID: ${data.roomId}`;
      this.socketService.roomId = this.currentRoomId;
      console.log('Room created:', data);
    });

  
    this.socketService.onRoomJoined().subscribe((data: any) => {
      this.isLoading = false;
      this.currentRoomId = data.roomId;
      this.players = data.room.players;
      this.isInRoom = true;
      this.showJoinForm = false;
      this.message = `Successfully joined room ${data.roomId}`;
      console.log('Joined room:', data);
    });

    this.socketService.onPlayerJoined().subscribe((data: any) => {
      this.players = data.players;
      if (data.playerName !== this.playerName) {
        this.message = `${data.playerName} joined the room`;
        setTimeout(() => this.message = '', 3000);
      }
      console.log('Player joined:', data);
    });
  
    this.socketService.onError().subscribe((error: any) => {
      this.isLoading = false;
      this.message = `Error: ${error.message}`;
      console.error('Socket error:', error);
    });
  }

  onNameEntered() {
    if (this.playerName.trim()) {
      this.message = '';
    }
  }

  showJoinRoomForm() {
    this.showJoinForm = true;
    this.message = '';
  }

  goBack() {
    this.showJoinForm = false;
    this.roomId = '';
    this.message = '';
  }

  createRoom() {
    if (!this.playerName.trim()) {
      this.message = 'Please enter your name';
      return;
    }
    this.isLoading = true;
    this.loadingMessage = 'Creating your room...';
    this.message = '';
    this.socketService.createRoom(this.playerName);
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




}
