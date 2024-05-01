import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/users.schema';

@Module({
  // Define the imports necessary for this module
  imports: [
    // MongooseModule for feature registers the schema that will be used for the User model
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  // Declare the controller that handles the incoming requests and returns responses
  controllers: [UsersController],
  // List all services that will be provided by this module
  providers: [UsersService],
  // Exports UsersService so it can be reused in other modules across the application
  exports: [UsersService],
})
export class UsersModule {}
