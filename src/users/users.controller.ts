import { Controller, Get, HttpCode, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { Body, Param } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UtilsService } from 'src/utils/utils.service';

@Controller('users') // Defines the route at the class level; all methods in this controller will be prefixed with '/users'
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly utilsService: UtilsService,
  ) {}

  /**
   * Handles POST requests to create a new user. It first checks if a user with the given address exists.
   * If the user exists, it returns an error response. If not, it generates a nonce, creates a new user, and returns a success response.
   * @param {CreateUserDto} createUserDto - The data transfer object (DTO) for creating a user.
   * @returns {Promise<object>} - The response object indicating success or error.
   */
  @Post()
  @HttpCode(200) // Specifies that the HTTP status code to be returned is 200 (OK) if the request succeeds
  async create(@Body() createUserDto: CreateUserDto) {
    const isUserExist = await this.usersService.userExistByAddresss(
      createUserDto.address,
    );
    if (isUserExist) {
      const errorMessage = `The user already exist for the address(${createUserDto.address})`;
      return this.utilsService.errorResponse('N4090', errorMessage);
    } else {
      const nonce = await this.utilsService.generateNonce(10);
      createUserDto.nonce = nonce;
      const newUser = await this.usersService.create(createUserDto);
      return this.utilsService.successResponse({ nonce: newUser.nonce });
    }
  }

  /**
   * Handles GET requests to retrieve the nonce for a user by their address.
   * If no user exists for the provided address, it returns an error. Otherwise, it retrieves and returns the nonce.
   * @param {string} address - The address of the user to lookup.
   * @returns {Promise<object>} - The response object with the nonce or an error message.
   */
  @Get('/nonce/:address')
  async findNonce(@Param('address') address: string) {
    const isUserExist = await this.usersService.userExistByAddresss(address);
    if (!isUserExist) {
      const errorMessage = `The user does not exist for the address(${address})`;
      return this.utilsService.errorResponse('N4040', errorMessage);
    } else {
      const result = await this.usersService.getNonceByAddress(address);
      return this.utilsService.successResponse({ nonce: result.nonce });
    }
  }
}
