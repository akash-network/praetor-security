// Import necessary decorators and services from NestJS and local files
import { Global, Module } from '@nestjs/common';
import { UtilsService } from './utils.service';

@Global() // Decorator that makes the module global within the application
@Module({
  providers: [UtilsService], // Declare UtilsService to be managed by the NestJS IoC container
  exports: [UtilsService], // Export UtilsService so it can be used in other modules throughout the application
})
export class UtilsModule {}
