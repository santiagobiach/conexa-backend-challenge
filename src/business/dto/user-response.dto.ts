import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty({
    description: 'Email of the user',
    example: 'test@mail.com',
  })
  email: string;
}

export class PaginatedResponseDto {
  @ApiProperty({ isArray: true })
  users: UserResponse[];

  @ApiProperty({
    description: 'Current page number',
  })
  page: number;

  @ApiProperty({
    description: 'Number of users per page',
  })
  limit: number;

  @ApiProperty({
    description: 'Total users',
  })
  totalUsers: number;

  @ApiProperty({
    description: 'Total pages',
  })
  totalPages: number;
}
