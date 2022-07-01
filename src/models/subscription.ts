import { DateTime } from 'luxon';
import { ObjectId } from 'mongodb';
import { BaseModel } from './baseModel';

export interface SubscriptionMember extends BaseModel {
  userId: ObjectId;
  transactions: ObjectId[];
}

export interface Subscription extends BaseModel {
  _id: ObjectId;
  name: string;
  ownerId: ObjectId;
  members: SubscriptionMember[];
  paymentMethods: ObjectId[];
  price: number;
  lastBill: DateTime;
  nextBill: DateTime;
}
