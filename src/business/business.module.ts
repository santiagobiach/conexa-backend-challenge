import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
