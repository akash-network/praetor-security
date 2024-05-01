import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ type: String, required: true, unique: true, lowercase: true })
  address: string;

  @Prop({ required: true })
  nonce: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
