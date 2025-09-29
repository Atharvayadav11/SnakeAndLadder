import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild
} from '@angular/core';
import { DiceComponent } from "../dice/dice.component";

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

  currentCell = 1;
  animating = false;

  ngOnInit() {
    this.boardImage.src = 'image.png';
    this.socketService.onMove((playerId: string, val: number) => {
      const user = this.socketService.getUser(playerId);
      console.log("User" + user);
      
      if (user) {
        this.hopToCell(playerId, Math.min(user.currentPosition + val, 100));
      }
    });

  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    this.boardImage.onload = () => {
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.drawGrid();
      // do not place the piece on cell 1 initially; pieces shown outside via HTML
    };
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

  private drawBall(x: number, y: number) {
    this.ctx.beginPath();
    this.ctx.fillStyle = '#FFA500';
    this.ctx.arc(x, y, 10, 0, Math.PI * 2);
    this.ctx.fill();
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

  private hopOneStep(startCell: number, nextCell: number, callback: () => void) {
    const start = this.getCoords(startCell);
    const end = this.getCoords(nextCell);

    let progress = 0;
    const duration = 50;

    const animate = () => {
      const canvas = this.canvasRef.nativeElement;

      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.drawGrid();

      progress++;
      const t = progress / duration;

      const x = start.x + (end.x - start.x) * t;
      const hopHeight = 20;
      const y =
        start.y +
        (end.y - start.y) * t -
        hopHeight * Math.sin(Math.PI * t);

      this.drawBall(x, y);

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        this.currentCell = nextCell;
        callback();
      }
    };

    animate();
  }

  private hopToCell(targetCell: number) {
    if (this.animating) return;
    this.animating = true;

    let step = this.currentCell;

    const doNextHop = () => {
      if (step === targetCell) {
        this.animating = false;
        return;
      }

      const nextStep = step + 1;
      this.hopOneStep(step, nextStep, () => {
        step = nextStep;
        doNextHop();
      });
    };

    doNextHop();
  }

  onInputChange(event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value);
    if (val >= 1 && val <= 100) {
      this.hopToCell(Math.min(this.currentCell + val, 100));
    } else {
      alert('Enter a number between 1 and 100');
    }
  }
}
