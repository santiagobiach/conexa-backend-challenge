import { Module } from '@nestjs/common';
import { LoginModule } from './login/login.module';
import { DatabaseModule } from './database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BusinessModule } from './business/business.module';

@Module({
  imports: [
    LoginModule,
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes it accessible across the entire app
    }),

    // Configure Mongoose to use the env variable
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'), // Get mongoDB url from .env
      }),
      inject: [ConfigService], // Inject ConfigService
    }),

    BusinessModule,
  ],
})
export class AppModule {}
