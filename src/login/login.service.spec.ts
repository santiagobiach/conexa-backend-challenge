import { Test, TestingModule } from '@nestjs/testing';
import { LoginService } from './login.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { BusinessService } from '../business/business.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { QueryUsersDTO } from './dto/query-users.dto';

describe('LoginService', () => {
  let service: LoginService;
  let mockDatabaseService = {
    findOne: jest.fn(),
    create: jest.fn(),
  };
  let mockBusinessService = {
    getUsers: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: BusinessService,
          useValue: mockBusinessService,
        },
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
    }).compile();

    service = module.get<LoginService>(LoginService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register the user', async () => {
      const user: CreateUserDto = {
        email: 'email@email.com',
        password: 'Secure123@.',
      };

      const mockFindOne = jest
        .spyOn(mockDatabaseService, 'findOne')
        .mockImplementation(() => null);
      const mockCreate = jest
        .spyOn(mockDatabaseService, 'create')
        .mockImplementation(() => true);
      const result = await service.register(user);
      expect(result).toEqual({
        message: 'User created successfully',
      });

      expect(mockFindOne).toHaveBeenCalledWith(user.email);
      expect(mockCreate).toHaveBeenCalled();
    });

    it('should fail if user already exists', async () => {
      const user: CreateUserDto = {
        email: 'email@email.com',
        password: 'Secure123@.',
      };

      jest.spyOn(mockDatabaseService, 'findOne').mockImplementation(() => true);
      jest.spyOn(mockDatabaseService, 'create').mockImplementation(() => true);
      await expect(service.register(user)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login the user if it is valid', async () => {
      const user: LoginUserDto = {
        email: 'email@email.com',
        password: 'Secure123@.',
      };

      const mockValidUser = jest
        .spyOn(service, 'validateUser')
        .mockResolvedValue(true);
      const result = await service.login(user);
      expect(result).toEqual({
        email: user.email,
        access_token: 'mocked-jwt-token',
      });

      expect(mockValidUser).toHaveBeenCalledWith(user);
    });

    it('should fail if user does not exist', async () => {
      const user: LoginUserDto = {
        email: 'email@email.com',
        password: 'Secure123@.',
      };

      jest
        .spyOn(mockDatabaseService, 'findOne')
        .mockImplementation(() => false);
      await expect(service.login(user)).rejects.toThrow(UnauthorizedException);
    });
    jest.spyOn(mockDatabaseService, 'create').mockImplementation(() => true);

    it('should fail if passwords are different', async () => {
      const user: LoginUserDto = {
        email: 'email@email.com',
        password: 'Secure123@.',
      };

      jest.spyOn(mockDatabaseService, 'findOne').mockImplementation(() => {
        return { password: 'somePassword' };
      });
      await expect(service.login(user)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('users', () => {
    it('should return the list of users', async () => {
      const query: QueryUsersDTO = {
        limit: 10,
        page: 1,
        email: 'abc',
      };

      const mockValidUser = jest
        .spyOn(mockBusinessService, 'getUsers')
        .mockResolvedValue({ users: [] });
      const result = await service.findUsers(query);
      expect(result).toEqual({ users: [] });

      expect(mockValidUser).toHaveBeenCalledWith(query);
    });

    it('should use default values for query if none are present', async () => {
      const query: QueryUsersDTO = {};

      const mockValidUser = jest
        .spyOn(mockBusinessService, 'getUsers')
        .mockResolvedValue({ users: [] });
      const result = await service.findUsers(query);
      expect(result).toEqual({ users: [] });

      expect(mockValidUser).toHaveBeenCalledWith({
        limit: 10,
        page: 1,
        email: '',
      });
    });
  });
});
