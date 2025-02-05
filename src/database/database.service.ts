import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class DatabaseService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(email: string, password: string): Promise<User> {
    const newUser = await this.userModel.create({
      email: email,
      password: password,
    });
    return newUser;
  }

  async findAll(skip: number, limit: number, email: string): Promise<User[]> {
    const filter = email ? { email: { $regex: email, $options: 'i' } } : {};
    return await this.userModel.find(filter).skip(skip).limit(limit);
  }
  async countUsers(email: string): Promise<number> {
    const filter = email ? { email: { $regex: email, $options: 'i' } } : {};
    return this.userModel.countDocuments(filter);
  }
  async findOne(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email });
  }
}
