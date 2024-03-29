import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateInstallationDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  url: string;
}

export class UpdateInstallationDto extends PartialType(CreateInstallationDto) {}
