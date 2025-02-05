import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { QueryUsersDTO } from './dto/query-users.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtService } from '@nestjs/jwt';
import { BusinessService } from '../business/business.service';
import { PaginatedResponseDto } from '../business/dto/user-response.dto';

@Injectable()
export class LoginService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly businessService: BusinessService,
  ) {}

  async register(user: CreateUserDto) {
    //First we check if the mail has already been used

    const alreadyExists = await this.databaseService.findOne(user.email);
    if (alreadyExists) {
      throw new ConflictException('Email is already in use');
    }
    // We hash the password to store it securely in the DB, preventing problems if data leaks
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(user.password, saltOrRounds);
    const result = await this.databaseService.create(user.email, hash);
    return { message: 'User created successfully' };
  }

  async login(loginInfo: LoginUserDto): Promise<LoginResponseDto> {
    const isValid = await this.validateUser(loginInfo);
    if (!isValid) {
      throw new UnauthorizedException();
    }
    return await this.generateJwt(loginInfo);
  }
  async validateUser(loginInfo: LoginUserDto): Promise<boolean> {
    const user = await this.databaseService.findOne(loginInfo.email);
    if (!user) {
      return false;
    }
    return bcrypt.compare(loginInfo.password, user.password);
  }
  async generateJwt(loginInfo: LoginUserDto): Promise<LoginResponseDto> {
    const payload = {
      sub: loginInfo.email,
    };
    const access_token = await this.jwtService.signAsync(payload);
    return { email: loginInfo.email, access_token };
  }

  async findUsers(queryParam: QueryUsersDTO): Promise<PaginatedResponseDto> {
    return await this.businessService.getUsers({
      page: queryParam.page || 1,
      limit: queryParam.limit || 10,
      email: queryParam.email || '',
    });
  }
}
