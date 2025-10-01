import {Module } from '@nestjs/common';
import { RoomsService } from './rooms.service'; 
import { GameService } from 'src/game/game.service';

@Module({
    providers: [RoomsService,GameService],
    exports: [RoomsService],
})
export class RoomsModule {}