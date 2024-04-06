import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateInstallationDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateInstallationDto extends PartialType(CreateInstallationDto) {}
