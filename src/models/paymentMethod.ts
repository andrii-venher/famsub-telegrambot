import { ObjectId } from 'mongodb';
import { BaseModel } from './baseModel';

export interface PaymentMethod extends BaseModel {
  _id: ObjectId;
  ownerId: ObjectId;
  description: string;
  data: string;
  currency: string;
}
