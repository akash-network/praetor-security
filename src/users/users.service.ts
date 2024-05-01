import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/users.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async userExistByAddresss(address: string): Promise<boolean> {
    let isUserExist = false;
    const user = await this.userModel.findOne({ address });

    if (user !== null) {
      isUserExist = true;
    }

    return isUserExist;
  }

  async getNonceByAddress(address: string): Promise<User> {
    const user = this.userModel.findOne(
      { address: address },
      { _id: 0, nonce: 1 },
    );
    return user;
  }

  async updateNonceByAddress(address: string, nonce: string): Promise<boolean> {
    await this.userModel.updateOne(
      { address: address },
      { $set: { nonce: nonce } },
    );
    return true;
  }
}
