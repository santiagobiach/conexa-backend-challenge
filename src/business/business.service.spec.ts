import { Test, TestingModule } from '@nestjs/testing';
import { BusinessService } from './business.service';
import { DatabaseService } from '../database/database.service';
import { QueryDto } from './dto/query.dto';
import { PaginatedResponseDto } from './dto/user-response.dto';

describe('BusinessService', () => {
  let service: BusinessService;
  let mockDatabaseService = {
    findAll: jest.fn(),
    countUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        BusinessService,
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('users', () => {
    it('should find users given the query provided', async () => {
      const query: QueryDto = {
        page: 2,
        limit: 10,
        email: '',
      };
      const mockFindAll = jest
        .spyOn(mockDatabaseService, 'findAll')
        .mockResolvedValue([
          { email: 'mail@test.com', password: 'testpassword' },
        ]);
      const mockCountUsers = jest
        .spyOn(mockDatabaseService, 'countUsers')
        .mockResolvedValue(11);
      const result = await service.getUsers(query);
      const expectedResult: PaginatedResponseDto = {
        users: [
          {
            email: 'mail@test.com',
          },
        ],
        page: 2,
        limit: 10,
        totalPages: 2,
        totalUsers: 11,
      };
      expect(result).toEqual(expectedResult);

      expect(mockFindAll).toHaveBeenCalledWith(10, 10, '');
      expect(mockCountUsers).toHaveBeenCalledWith('');
    });
  });
});
