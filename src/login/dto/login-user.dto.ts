import { IsEmail, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @IsEmail()
  @ApiProperty({
    description: 'Email of the user trying to log in',
    example: 'mail@test.com',
  })
  email: string;

  @IsStrongPassword()
  @ApiProperty({
    description: 'Password of the user trying to log in.',
    example: 'Example123.',
  })
  password: string;
}
