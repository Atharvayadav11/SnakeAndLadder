import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomsModule } from './rooms/rooms.module';
import { GameModule } from './game/game.module';
import { RoomsGateway } from './rooms/rooms.gateway';
import { GameGateway } from './game/game.gateway';

@Module({
  imports: [RoomsModule, GameModule],
  controllers: [AppController],
  providers: [AppService,RoomsGateway, GameGateway],
})
export class AppModule {}
