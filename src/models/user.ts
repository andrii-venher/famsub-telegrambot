import { ObjectId } from 'mongodb';
import { BaseModel } from './baseModel';

export interface User extends BaseModel {
  _id: ObjectId;
  telegramId: string;
  telegramUsername: string;
  name: string;
  subscriptions: ObjectId[];
  paymentMethods: ObjectId[];
}
