import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild, inject
} from '@angular/core';
import { DiceComponent } from "../dice/dice.component";
import { SocketService } from '../services/socket.services';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
  imports: [DiceComponent]
})
export class BoardComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private boardImage = new Image();
  private socketService = inject(SocketService);

  animating = false;

  ngOnInit() {
    this.boardImage.src = 'image.png';

    // Subscribe to dice rolls
    this.socketService.onMove((playerId: string, val: number) => {
      const user = this.socketService.getUser(playerId);
      if (user) {
        this.hopToCell(playerId, Math.min(user.currentPosition + val, 100));
      }
    });
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    this.boardImage.onload = () => {
      this.redrawBoard();
    };
  }

  private redrawBoard() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawGrid();

    // Draw all users
    for (const [playerId, user] of this.socketService.getUsers()) {
      const { x, y } = this.getCoords(user.currentPosition);
      this.drawBall(x, y, user.color, playerId);
    }
  }

  private drawGrid() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.beginPath();
    this.ctx.drawImage(this.boardImage, 0, 0, canvas.width, canvas.height);

    for (let x = 0; x <= 600; x += 60) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, 600);
    }

    for (let y = 0; y <= 600; y += 60) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(600, y);
    }

    this.ctx.stroke();
  }

  private drawBall(x: number, y: number, color: string, playerId: string) {
    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.arc(x, y, 10, 0, Math.PI * 2);
    this.ctx.fill();

    // Optionally add initials
    this.ctx.fillStyle = "white";
    this.ctx.font = "10px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(playerId[0].toUpperCase(), x, y + 3);
  }

  private getCoords(cell: number) {
    const row = Math.floor((cell - 1) / 10);
    const col = (cell - 1) % 10;

    const y = 600 - row * 60 - 30;
    let x;

    if (row % 2 === 0) {
      x = col * 60 + 30;
    } else {
      x = 600 - col * 60 - 30;
    }

    return { x, y };
  }

  private hopOneStep(playerId: string, startCell: number, nextCell: number, callback: () => void) {
    const start = this.getCoords(startCell);
    const end = this.getCoords(nextCell);

    let progress = 0;
    const duration = 50;

    const animate = () => {
      progress++;
      const t = progress / duration;

      const x = start.x + (end.x - start.x) * t;
      const hopHeight = 20;
      const y =
        start.y +
        (end.y - start.y) * t -
        hopHeight * Math.sin(Math.PI * t);

      this.redrawBoard(); // redraw everyone
      const user = this.socketService.getUser(playerId);
      this.drawBall(x, y, user!.color, playerId); // overwrite moving ball

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        this.socketService.updateUserPosition(playerId, nextCell);
        callback();
      }
    };

    animate();
  }

  private hopToCell(playerId: string, targetCell: number) {
    if (this.animating) return;
    this.animating = true;

    let step = this.socketService.getUser(playerId)!.currentPosition;

    const doNextHop = () => {
      if (step === targetCell) {
        this.animating = false;
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
}

