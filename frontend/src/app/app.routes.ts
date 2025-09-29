import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { BoardComponent } from './board/board.components';


export const routes: Routes = [
    {
        path: '',component:HomeComponent

    },
    {
        path:'game',component:BoardComponent,
        children:[
            {
                path:':roomId',component:BoardComponent
            }
        ]
    }
];
