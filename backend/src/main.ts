import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// import { RoomsService } from './rooms/rooms.service';
// import { GameService } from './game/game.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for the REST API
  app.enableCors({
    origin: ['http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  // // Get the RoomsService instance
  // const roomsService = app.get(RoomsService);
  // const gameService = app.get(GameService);
  
  // const { httpServer } = await setupSocket(app.getHttpAdapter().getInstance(), roomsService, gameService);
  
  // await app.init();
  // httpServer.listen(process.env.PORT ?? 3000, () => {
  //   console.log('Server listening on port 3000 with Socket.IO enabled');
  // });
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server listening on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
