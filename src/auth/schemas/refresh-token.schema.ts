import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ collection: 'refresh_tokens' })
export class RefreshToken {
  @Prop({ type: String, required: true, unique: true, lowercase: true })
  uuid: string;

  @Prop({ type: Array, required: true })
  tokens: Array<string>;

  @Prop({ type: Boolean, required: true })
  valid: boolean;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
