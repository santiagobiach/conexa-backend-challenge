import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { QueryDto } from './dto/query.dto';
import { PaginatedResponseDto } from './dto/user-response.dto';
@Injectable()
export class BusinessService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getUsers(query: QueryDto): Promise<PaginatedResponseDto> {
    const skip = (query.page - 1) * query.limit;
    const users = await this.databaseService.findAll(
      skip,
      query.limit,
      query.email,
    );
    const totalUsers = await this.databaseService.countUsers(query.email);
    const totalPages = Math.ceil(totalUsers / query.limit);

    //Filter password to not expose hashes
    const usersResponse = users.map((user) => {
      return { email: user.email };
    });
    const response: PaginatedResponseDto = {
      users: usersResponse,
      totalUsers: totalUsers,
      totalPages: totalPages,
      page: query.page,
      limit: query.limit,
    };
    return response;
  }
}
