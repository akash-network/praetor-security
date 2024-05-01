import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from 'src/users/schemas/users.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';
import { UsersModule } from 'src/users/users.module';
import configuration from './../config/configuration';

@Module({
  // Import necessary modules for the authentication module
  imports: [
    // ConfigModule loads environment specific configuration details
    ConfigModule.forRoot({ load: [configuration] }),
    // MongooseModule for feature registers the schemas for User and RefreshToken
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    // UsersModule includes user management functionalities, used by AuthService
    UsersModule,
  ],
  // Controllers to handle incoming requests
  controllers: [AuthController],
  // Providers to handle business logic and interact with data models
  providers: [AuthService],
})
export class AuthModule {}
