import { ObjectID } from 'bson';
import { DateTime } from 'luxon';
import { ObjectId } from 'mongodb';
import { BaseModel } from './baseModel';

export interface Transaction extends BaseModel {
  _id: ObjectId;
  payerId: ObjectId;
  subscriptionId: ObjectID;
  paymentMethodId: ObjectID;
  amount: number;
  date: DateTime;
}
