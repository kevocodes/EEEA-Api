import { PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateEventDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsISO8601({ strict: true })
  @IsNotEmpty()
  datetime: Date;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  location: string;
}

export class UpdateEventDto extends PartialType(CreateEventDto) {}

export class UpdateEventStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  completed: boolean;
}

export class findAllEventsDto {
  @Type(() => Number)
  @IsOptional()
  year?: number;

  @Type(() => Number)
  @Min(1)
  @Max(12)
  @IsNotEmpty()
  @ValidateIf((event) => event.endMonth)
  startMonth?: number;

  @Type(() => Number)
  @Min(1)
  @Max(12)
  @IsNotEmpty()
  @ValidateIf((event) => event.startMonth)
  endMonth?: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  groupedByMonth?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  completed?: boolean;

  @IsOptional()
  @IsEnum({ asc: 'asc', desc: 'desc' })
  order?: 'asc' | 'desc';
}
