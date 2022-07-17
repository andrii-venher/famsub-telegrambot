import { DateTime } from 'luxon';
import { ObjectId } from 'mongodb';
import { BaseModel } from './baseModel';
import { Currency } from './currency';

export interface SubscriptionMember {
  userId: ObjectId;
  balance: number;
  transactions?: ObjectId[];
}

export enum Periodicity {
  Monthly = 'Monthly',
}

export interface Subscription extends BaseModel {
  _id?: ObjectId;
  name?: string;
  ownerId?: ObjectId;
  members?: SubscriptionMember[];
  paymentMethods?: ObjectId[];
  price?: number;
  currency?: Currency;
  periodicity?: Periodicity;
  lastBill?: DateTime;
  lastBillTimestamp?: number;
  nextBill?: DateTime;
  nextBillTimestamp?: number;
  billDay?: number;
}
