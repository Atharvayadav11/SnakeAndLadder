import {Module } from '@nestjs/common';
import { RoomsService } from './rooms.service'; 
import { GameService } from 'src/game/game.service';
import { RoomsGateway } from './rooms.gateway';

@Module({
    providers: [RoomsService,GameService,RoomsGateway],
    exports: [RoomsService],
})
export class RoomsModule {}