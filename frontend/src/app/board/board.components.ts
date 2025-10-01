import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiceComponent } from "../dice/dice.component";
import { BoardService } from './board.services';
import { HomeService } from '../home/home.services';
import { DiceService } from '../dice/dice.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  imports: [DiceComponent, CommonModule]
})
export class BoardComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private boardImage = new Image();
  animating = false;
  private animatingPlayerId: string | null = null;

  private readonly STARTING_POSITIONS = [
    { x: 50, y: 550 },
    { x: 100, y: 550 },
    { x: 50, y: 500 },
    { x: 100, y: 500 }
  ];

  private readonly LADDERS: { [key: number]: number } = {
    5: 58,
    42: 60,
    14: 49,
    53: 72,
    64: 83,
    75: 94
  };

  private readonly SNAKES: { [key: number]: number } = {
    38: 20,
    45: 7,
    51: 10,
    65: 54,
    97: 61,
    91: 73
  };

  private playerImages: { [color: string]: HTMLImageElement } = {};

  constructor(public boardService: BoardService, private userService: HomeService, public diceService: DiceService) {
    ['red','blue','yellow','green'].forEach(color => {
      const img = new Image();
      img.src = `/${color}.png`;
      this.playerImages[color] = img;
    });
  };

  ngOnInit() {
    this.boardImage.src = 'image.png';

    this.boardService.onMove((playerId: string, val: number) => {
      console.log(`Player ${playerId} rolled ${val}`);

      const user = this.boardService.getUser(playerId);
      if (!user) {
        console.error(`User ${playerId} not found`);
        return;
      }

      if (user.currentPosition === 0 && val === 6) {
        this.enterBoard(playerId);
      } else if (user.currentPosition > 0) {
        const targetPosition = Math.min(user.currentPosition + val, 100);
        this.hopToCell(playerId, targetPosition);
      } else {
        this.redrawBoard();
      }
    });

    // this.userService.onGameStarted().subscribe((data) => {
    //   console.log('Game started!', data);
    //   setTimeout(() => this.redrawBoard(), 100);
    // });

    this.redrawBoard()
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    this.boardImage.onload = () => {
      console.log('Board image loaded');
      this.redrawBoard();
    };
    this.boardImage.onerror = () => {
      console.warn('Board image failed to load, drawing without background');
      this.redrawBoard();
    };
  }

  private redrawBoard() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.fillStyle = 'transparent';
    this.ctx.fillRect(150, 0, canvas.width, canvas.height);

    if (this.boardImage.complete && this.boardImage.naturalHeight !== 0) {
      this.ctx.drawImage(this.boardImage, 150, 0, 600, 600);
    }

    const usersIterator = this.boardService.getUsers();
    if (!usersIterator) {
      console.warn('No users found');
      return;
    }
    
    let playerIndex = 0;
    for (const [playerId, user] of usersIterator) {
      if (playerId === this.animatingPlayerId) {
        playerIndex++;
        continue;
      }
      if (user.currentPosition === 0) {
        const startPos = this.STARTING_POSITIONS[playerIndex % 4];
        this.drawBall(startPos.x, startPos.y, user.color);
      } else {
        const { x, y } = this.getCoords(user.currentPosition);
        this.drawBall(x, y, user.color);
      }
      playerIndex++;
    }
  }

  private drawBall(x: number, y: number, color: string) {
    const img = this.playerImages[color];

    if (img && img.complete) {
      this.ctx.drawImage(img, x - 12, y - 12, 24, 24);
    } else {
      this.ctx.beginPath();
      this.ctx.fillStyle = color;
      this.ctx.arc(x, y, 10, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.fillStyle = "white";
    this.ctx.font = "bold 10px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
  }

  private getCoords(cell: number) {
    const row = Math.floor((cell - 1) / 10);
    const col = (cell - 1) % 10;

    const y = 600 - row * 60 - 30;
    let x;

    if (row % 2 === 0) {
      x = 150+col * 60 + 30;
    } else {
      x = 600 - col * 60 - 30;
    }

    return { x, y };
  }

  private enterBoard(playerId: string) {
    if (this.animating) {
      console.log('Already animating, queuing...');
      setTimeout(() => this.enterBoard(playerId), 100);
      return;
    }

    this.animating = true;
    this.animatingPlayerId = playerId;

    let playerIndex = 0;
    for (const [id] of this.boardService.getUsers()) {
      if (id === playerId) break;
      playerIndex++;
    }

    const startPos = this.STARTING_POSITIONS[playerIndex % 4];
    const endPos = this.getCoords(1);
    const user = this.boardService.getUser(playerId);

    if (!user) {
      console.error(`User ${playerId} not found during enter animation`);
      this.animating = false;
      return;
    }

    let progress = 0;
    const duration = 80;

    const animate = () => {
      progress++;
      const t = progress / duration;
      const easedT = t < 0.5 ? 2 * t * t : -1 + (2 * t) * t;

      const x = startPos.x + (endPos.x - startPos.x) * easedT;
      const hopHeight = 50;
      const y = startPos.y + (endPos.y - startPos.y) * easedT - hopHeight * Math.sin(Math.PI * easedT);

      this.redrawBoard();
      this.drawBall(x, y, user.color);

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        this.boardService.updateUserPosition(playerId, 1);
        this.redrawBoard();
        this.animating = false;
        console.log(`Player ${playerId} entered at position 1`);
      }

      this.hopToCell(playerId, 6);
    };

    animate();
    this.animatingPlayerId = null;
  }

  private hopOneStep(playerId: string, startCell: number, nextCell: number, callback: () => void) {
    const start = this.getCoords(startCell);
    const end = this.getCoords(nextCell);
    const user = this.boardService.getUser(playerId);

    if (!user) {
      console.error(`User ${playerId} not found during hop`);
      callback();
      return;
    }

    let progress = 0;
    const duration = 30;

    const animate = () => {
      progress++;
      const t = progress / duration;

      const x = start.x + (end.x - start.x) * t;
      const hopHeight = 25;
      const y = start.y + (end.y - start.y) * t - hopHeight * Math.sin(Math.PI * t);

      this.redrawBoard();
      this.drawBall(x, y, user.color);

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        this.boardService.updateUserPosition(playerId, nextCell);
        callback();
      }
    };

    animate();
  }

  private hopToCell(playerId: string, targetCell: number) {
    if (this.animating) {
      console.log('Already animating, queuing...');
      setTimeout(() => this.hopToCell(playerId, targetCell), 100);
      return;
    }

    this.animating = true;
    this.animatingPlayerId = playerId;

    const user = this.boardService.getUser(playerId);
    if (!user) {
      console.error(`User ${playerId} not found during hop to cell`);
      this.animating = false;
      return;
    }

    let step = user.currentPosition;

    const doNextHop = () => {
      if (step >= targetCell) {
        this.checkSnakesAndLadders(playerId, targetCell);
        return;
      }

      const nextStep = step + 1;
      this.hopOneStep(playerId, step, nextStep, () => {
        step = nextStep;
        doNextHop();
      });
    };

    doNextHop();
  }

  private checkSnakesAndLadders(playerId: string, position: number) {
    const user = this.boardService.getUser(playerId);
    if (!user) {
      this.animating = false;
      return;
    }

    if (this.SNAKES[position]) {
      const snakeEnd = this.SNAKES[position];
      console.log(`Snake! Player ${playerId} goes from ${position} to ${snakeEnd}`);

      setTimeout(() => {
        this.slideToPosition(playerId, position, snakeEnd);
      }, 500);
      return;
    }

    // Check for ladder
    if (this.LADDERS[position]) {
      const ladderEnd = this.LADDERS[position];
      // Take user i/p here.
      // If yes then skip the next part and update the user object and emit a event to backend.
      // If no then continue as it is
      console.log(`Ladder! Player ${playerId} climbs from ${position} to ${ladderEnd}`);

      setTimeout(() => {
        this.slideToPosition(playerId, position, ladderEnd);
      }, 500);
      return;
    }

    if (this.boardService.isGameEnded()) {
      console.log(`Player ${playerId} wins!`);
      this.showWinner(playerId);
    }

    this.animating = false;
    this.animatingPlayerId = null;
  }

  private slideToPosition(playerId: string, from: number, to: number) {
    const start = this.getCoords(from);
    const end = this.getCoords(to);
    const user = this.boardService.getUser(playerId);

    if (!user) {
      this.animating = false;
      return;
    }

    let progress = 0;
    const duration = 30;

    const animate = () => {
      progress++;
      const t = progress / duration;

      const x = start.x + (end.x - start.x) * t;
      const y = start.y + (end.y - start.y) * t;

      this.redrawBoard();
      this.drawBall(x, y, user.color);

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        this.boardService.updateUserPosition(playerId, to);
        this.redrawBoard();
        this.animating = false;
      }
    };

    animate();
    this.animatingPlayerId = null;
  }

  private showWinner(playerId: string) {
    const user = this.boardService.getUser(playerId);
    if (!user) return;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, 600, 600);

    this.ctx.fillStyle = user.color;
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(`${user.name} Wins!`, 300, 300);
  }

  getCurrentPlayerName(): string {
    const currentPlayerId = this.boardService.currentUser();
    if (!currentPlayerId) return 'Waiting...';

    const user = this.boardService.getUser(currentPlayerId);
    return user?.name || currentPlayerId;
  }

  getPlayersList(): Array<{ id: string; name: string; color: string; currentPosition: number; isActive: boolean }> {
    const players: Array<{ id: string; name: string; color: string; currentPosition: number; isActive: boolean }> = [];

    for (const [playerId, user] of this.boardService.getUsers()) {
      players.push({
        id: playerId,
        name: user.name,
        color: user.color,
        currentPosition: user.currentPosition,
        isActive: user.isActive
      });
    }

    return players;
  }

  isCurrentPlayer(playerId: string): boolean {
    return this.boardService.currentUser() === playerId;
  }
}