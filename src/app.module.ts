// Import necessary NestJS modules and custom modules
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { UtilsModule } from './utils/utils.module';
import { AuthModule } from './auth/auth.module';
import { ProvidersModule } from './providers/providers.module';
import configuration from './config/configuration';

@Module({
  // Register and configure modules used in the application
  imports: [
    // Configuration module for managing environment variables and settings
    ConfigModule.forRoot({ load: [configuration] }),

    // Asynchronous Mongoose module initialization for MongoDB integration
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // Dependency on ConfigModule
      useFactory: async (configService: ConfigService) => ({
        // Configure MongoDB connection string dynamically based on environment config
        uri: `${configService.get(
          'mongodb.connectionString',
        )}/${configService.get('mongodb.name')}`,
      }),
      inject: [ConfigService], // Inject ConfigService to use in the factory function
    }),

    // Import custom modules representing different features of the application
    UsersModule, // Manages user-related functionality
    ProvidersModule, // Manages service providers
    AuthModule, // Handles authentication
    UtilsModule, // Provides utility functions and services
  ],
})
export class AppModule {}
