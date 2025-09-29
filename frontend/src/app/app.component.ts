import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BoardComponent } from './board/board.components';
import { HomeComponent } from './home/home.component';
import { DiceComponent } from "./dice/dice.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BoardComponent, HomeComponent, DiceComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
}
