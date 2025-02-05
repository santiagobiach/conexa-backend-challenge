import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Email of the logged user',
  })
  email: string;
  @ApiProperty({
    description: 'JWT for accessing the protected endpoints',
  })
  access_token: string;
}
