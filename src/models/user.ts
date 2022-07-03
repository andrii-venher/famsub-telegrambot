import { ObjectId } from 'mongodb';
import { BaseModel } from './baseModel';

export interface User extends BaseModel {
  _id?: ObjectId;
  telegramId: number;
  telegramUsername?: string;
  telegramFirstName: string;
  telegramLastName?: string;
  subscriptions?: ObjectId[];
  paymentMethods?: ObjectId[];
}
