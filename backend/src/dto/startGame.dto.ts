import { IsString } from 'class-validator';

export class StartGameDto {
  @IsString()
  playerId: string;

  @IsString()
  roomId: string;
}
