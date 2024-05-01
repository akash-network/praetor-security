import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';

@Module({
  // Registers the controllers that handle incoming requests for this module
  controllers: [ProvidersController],
  // Registers the service providers that contain the business logic for the module
  providers: [ProvidersService],
  // Exports the ProvidersService so it can be reused in other modules across the application
  exports: [ProvidersService],
})
export class ProvidersModule {}
