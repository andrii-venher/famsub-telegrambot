import { ObjectId } from 'mongodb';
import { BaseModel } from './baseModel';
import { Currency } from './currency';

export interface PaymentMethod extends BaseModel {
  _id: ObjectId;
  ownerId: ObjectId;
  description: string;
  data: string;
  currency: Currency;
}
