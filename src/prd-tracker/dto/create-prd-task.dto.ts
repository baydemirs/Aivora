import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreatePrdTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  module: string; // e.g., auth, rag, chat
}
