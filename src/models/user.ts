import { ObjectId } from 'mongodb';
import PaymentMethod from './paymentMethod';
import Subscription from './subscription';

export default interface User {
  _id: ObjectId;
  telegramId: string;
  telegramUsername: string;
  name: string;
  subscriptions: ObjectId[];
  paymentMethods: ObjectId[];
}
