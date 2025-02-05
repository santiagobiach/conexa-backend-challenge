import { IsEmail, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({
    description: 'A valid email for the new user',
    example: 'mail@test.com',
  })
  email: string;

  @IsStrongPassword()
  @ApiProperty({
    description:
      'A valid password for the new user. It needs to be a strong one.',
    example:
      'minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1',
  })
  password: string;
}
