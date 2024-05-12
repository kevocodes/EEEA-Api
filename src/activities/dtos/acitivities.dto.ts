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

export class CreateActivityDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsISO8601({ strict: true })
  @IsNotEmpty()
  datetime: Date;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isAllDay: boolean;
}

export class UpdateActivityDto extends PartialType(CreateActivityDto) {}

export class FindAllActivitiesDto {
  @Type(() => Number)
  @IsOptional()
  year?: number;

  @Type(() => Number)
  @Min(1)
  @Max(12)
  @IsNotEmpty()
  @ValidateIf((Activity) => Activity.endMonth)
  startMonth?: number;

  @Type(() => Number)
  @Min(1)
  @Max(12)
  @IsNotEmpty()
  @ValidateIf((Activity) => Activity.startMonth)
  endMonth?: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  groupedByMonth?: boolean;

  @IsOptional()
  @IsEnum({ asc: 'asc', desc: 'desc' })
  order?: 'asc' | 'desc';
}

export class FindAllActivitiesByMonthDto {
  @Type(() => Number)
  @IsNotEmpty()
  @Min(1)
  @Max(12)
  month: number;
}
