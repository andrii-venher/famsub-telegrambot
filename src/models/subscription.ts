import { DateTime } from 'luxon';
import { ObjectId } from 'mongodb';

export default interface SubscriptionMember {
  userId: ObjectId;
  transactions: ObjectId[];
}

export default interface Subscription {
  _id: ObjectId;
  name: string;
  ownerId: ObjectId;
  members: SubscriptionMember[];
  paymentMethods: ObjectId[];
  price: number;
  lastBill: DateTime;
  nextBill: DateTime;
}
