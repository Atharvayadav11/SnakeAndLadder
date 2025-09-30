import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // // Get the RoomsService instance
  // const roomsService = app.get(RoomsService);
  // const gameService = app.get(GameService);
  
  // const { httpServer } = await setupSocket(app.getHttpAdapter().getInstance(), roomsService, gameService);
  
  // await app.init();
  // httpServer.listen(process.env.PORT ?? 3000, () => {
  //   console.log('Server listening on port 3000 with Socket.IO enabled');
  // });
}
bootstrap();
