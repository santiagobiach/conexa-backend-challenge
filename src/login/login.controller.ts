import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { QueryUsersDTO } from './dto/query-users.dto';
import { LoginService } from './login.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { AuthGuard } from './guards/login.guard';
import { PaginatedResponseDto } from '../business/dto/user-response.dto';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({
    description: 'User created successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid data provided' })
  @ApiConflictResponse({ description: 'User with given email already exists' })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.loginService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Log in with user credentials' })
  @ApiOkResponse({ description: 'Succesfull login', type: LoginResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid data provided' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.loginService.login(loginUserDto);
  }

  @Get('users')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get users' })
  @ApiOkResponse({
    description: 'Succesfully queried users',
    type: PaginatedResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid data provided' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  users(@Query() query: QueryUsersDTO) {
    return this.loginService.findUsers(query);
  }
}
