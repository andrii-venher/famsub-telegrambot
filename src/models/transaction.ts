import { ObjectID } from 'bson';
import { DateTime } from 'luxon';
import { ObjectId } from 'mongodb';

export default interface Transaction {
  _id: ObjectId;
  payerId: ObjectId;
  subscriptionId: ObjectID;
  paymentMethodId: ObjectID;
  amount: number;
  date: DateTime;
}
