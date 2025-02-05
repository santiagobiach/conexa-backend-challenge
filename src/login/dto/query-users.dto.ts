import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
export class QueryUsersDTO {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  @ApiPropertyOptional({
    description: 'Page to query',
    example: '3',
    minimum: 1,
    type: 'number',
    default: 1,
  })
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  @ApiPropertyOptional({
    description: 'Max users to query',
    example: '10',
    minimum: 1,
    type: 'number',
    default: 10,
  })
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Filter by email (case insensitive)',
    example: 'example',
    type: 'string',
    default: '',
  })
  email?: string = '';
}
