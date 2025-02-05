import { Test, TestingModule } from '@nestjs/testing';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { ValidationPipe } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { QueryUsersDTO } from './dto/query-users.dto';
import { PaginatedResponseDto } from 'src/business/dto/user-response.dto';

describe('LoginController', () => {
  let controller: LoginController;
  let mockLoginService = {
    register: jest.fn((dto) => {
      return {
        message: 'User created successfully',
      };
    }),
    login: jest.fn((dto: LoginUserDto) => {
      return {
        email: dto.email,
        access_token: 'false-access-token',
      };
    }),
    findUsers: jest.fn((dto) => {
      return {
        users: [],
        page: 1,
        limit: 10,
        totalUsers: 0,
        totalPages: 1,
      };
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        LoginService,
        {
          provide: JwtService, // Mock JwtService
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mocked-jwt-token'),
            verifyAsync: jest
              .fn()
              .mockResolvedValue({ email: 'test@example.com', sub: '123' }),
          },
        },
        {
          provide: ConfigService, // Mock ConfigService
          useValue: {
            get: jest.fn().mockImplementation((key) => {
              if (key === 'JWT_SECRET') return 'test-secret';
              if (key === 'JWT_EXPIRES_IN') return '1h';
              return null;
            }),
          },
        },
      ],
    })
      .overrideProvider(LoginService)
      .useValue(mockLoginService)
      .compile();

    controller = module.get<LoginController>(LoginController);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('register', () => {
    it('should create an user', async () => {
      const user: CreateUserDto = {
        email: 'email@email.com',
        password: 'Secure123@.',
      };
      const result = await controller.create(user);
      expect(result).toEqual({
        message: 'User created successfully',
      });

      expect(mockLoginService.register).toHaveBeenCalledWith(user);
    });

    it('should raise an exception for invalid email', async () => {
      const user: CreateUserDto = {
        email: 'email',
        password: 'Secure123@.',
      };
      const validationPipe = new ValidationPipe();
      await expect(
        validationPipe.transform(user, {
          type: 'body',
          metatype: CreateUserDto,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should raise an exception for invalid password', async () => {
      const user: CreateUserDto = {
        email: 'email@mail.com',
        password: 'notsecure',
      };
      const validationPipe = new ValidationPipe();
      await expect(
        validationPipe.transform(user, {
          type: 'body',
          metatype: CreateUserDto,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not raise an exception if user is valid', async () => {
      const user: CreateUserDto = {
        email: 'email@mail.com',
        password: 'VerySecure123@.',
      };
      const validationPipe = new ValidationPipe();
      await expect(
        validationPipe.transform(user, {
          type: 'body',
          metatype: CreateUserDto,
        }),
      ).resolves.toEqual(user);
    });
  });

  describe('login', () => {
    it('should login the user', async () => {
      const user: LoginUserDto = {
        email: 'email@email.com',
        password: 'Secure123@.',
      };

      const expectedResponse: LoginResponseDto = {
        email: user.email,
        access_token: 'false-access-token',
      };
      const result = await controller.login(user);
      expect(result).toEqual(expectedResponse);

      expect(mockLoginService.login).toHaveBeenCalledWith(user);
    });

    it('should raise an exception for invalid email', async () => {
      const user: LoginUserDto = {
        email: 'email',
        password: 'Secure123@.',
      };
      const validationPipe = new ValidationPipe();
      await expect(
        validationPipe.transform(user, {
          type: 'body',
          metatype: LoginUserDto,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should raise an exception for invalid password', async () => {
      const user: LoginUserDto = {
        email: 'email@mail.com',
        password: 'notsecure',
      };
      const validationPipe = new ValidationPipe();
      await expect(
        validationPipe.transform(user, {
          type: 'body',
          metatype: LoginUserDto,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not raise an exception if user is valid', async () => {
      const user: LoginUserDto = {
        email: 'email@mail.com',
        password: 'VerySecure123@.',
      };
      const validationPipe = new ValidationPipe();
      await expect(
        validationPipe.transform(user, {
          type: 'body',
          metatype: LoginUserDto,
        }),
      ).resolves.toEqual(user);
    });
  });

  describe('users', () => {
    it('should query the users', async () => {
      const query: QueryUsersDTO = {
        limit: 10,
        page: 1,
      };

      const expectedResponse: PaginatedResponseDto = {
        users: [],
        page: 1,
        limit: 10,
        totalUsers: 0,
        totalPages: 1,
      };
      const result = await controller.users(query);
      expect(result).toEqual(expectedResponse);

      expect(mockLoginService.findUsers).toHaveBeenCalledWith(query);
    });

    it('should raise an exception for invalid limit', async () => {
      const query: QueryUsersDTO = {
        limit: 0,
        page: 1,
      };
      const validationPipe = new ValidationPipe();
      await expect(
        validationPipe.transform(query, {
          type: 'body',
          metatype: QueryUsersDTO,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should raise an exception for invalid page', async () => {
      const query: QueryUsersDTO = {
        limit: 10,
        page: 0,
      };
      const validationPipe = new ValidationPipe();
      await expect(
        validationPipe.transform(query, {
          type: 'body',
          metatype: QueryUsersDTO,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not raise an exception if user is valid', async () => {
      const query: QueryUsersDTO = {
        limit: 10,
        page: 1,
        email: 'a',
      };
      const validationPipe = new ValidationPipe();
      await expect(
        validationPipe.transform(query, {
          type: 'body',
          metatype: QueryUsersDTO,
        }),
      ).resolves.toEqual(query);
    });
  });
});
