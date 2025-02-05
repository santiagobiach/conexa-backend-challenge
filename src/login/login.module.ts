import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BusinessModule } from '../business/business.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    BusinessModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule
      inject: [ConfigService], // Inject ConfigService
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Get secret from .env
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') }, // Optional: Expiration time
      }),
    }),
  ],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
