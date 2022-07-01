import { ObjectId } from 'mongodb';

export default interface PaymentMethod {
  _id: ObjectId;
  ownerId: ObjectId;
  description: string;
  data: string;
  currency: string;
}
