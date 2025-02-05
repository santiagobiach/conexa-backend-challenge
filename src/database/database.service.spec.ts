import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { Model } from 'mongoose';

describe('DatabaseService', () => {
  let databaseService: DatabaseService;
  let userModel: Model<UserDocument>;

  const mockUser = {
    _id: '1',
    email: 'test@example.com',
    password: 'hashedpassword',
  };

  const mockUserModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    countDocuments: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    databaseService = module.get<DatabaseService>(DatabaseService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks(); // Reset mock calls after each test
  });

  it('should be defined', () => {
    expect(databaseService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      jest.spyOn(userModel, 'create').mockResolvedValueOnce(mockUser as any);

      const result = await databaseService.create(
        'test@example.com',
        'hashedpassword',
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const mockFind = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValueOnce([mockUser]),
      };

      jest.spyOn(userModel, 'find').mockReturnValue(mockFind as any);

      const result = await databaseService.findAll(0, 10, '');
      expect(userModel.find).toHaveBeenCalledWith({});
      expect(result).toEqual([mockUser]);
    });
  });

  describe('countUsers', () => {
    it('should return the number of users', async () => {
      jest.spyOn(userModel, 'countDocuments').mockResolvedValueOnce(5);

      const count = await databaseService.countUsers('');
      expect(userModel.countDocuments).toHaveBeenCalled();
      expect(count).toBe(5);
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(mockUser as any);

      const result = await databaseService.findOne('test@example.com');
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(null);

      const result = await databaseService.findOne('notfound@example.com');
      expect(result).toBeNull();
    });
  });
});
