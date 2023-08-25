import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreatePublicationDto {
  @IsInt()
  @IsNotEmpty()
  mediaId: string

  @IsInt()
  @IsNotEmpty()
  postId: string

  @IsString()
  @IsNotEmpty()
  date: string
}
