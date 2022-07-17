import config from '@/config';
import { ServiceResponse, ServiceResponseStatus } from '@/helpers/serviceResponse';
import { Subscription } from '@/models';
import { Periodicity } from '@/models/subscription';
import { DateTime } from 'luxon';
import { Collection, ObjectId } from 'mongodb';
import { Service } from 'typedi';
import BaseService from './baseService';

@Service()
export default class SubscriptionService extends BaseService<Subscription> {
  private subscriptionsCollection: Collection<Subscription> = this.db.collection(
    config.mongo.collections.subscriptions
  );

  public async getByMongoId(mongoId: ObjectId): Promise<ServiceResponse<Subscription>> {
    const subscription: Subscription = await this.subscriptionsCollection.findOne<Subscription>({ _id: mongoId });
    if (subscription === null) {
      return {
        status: ServiceResponseStatus.NotFound,
        data: null,
      };
    }
    if (subscription.nextBillTimestamp) {
      subscription.nextBill = DateTime.fromSeconds(subscription.nextBillTimestamp);
    }
    if (subscription.lastBillTimestamp) {
      subscription.lastBill = DateTime.fromSeconds(subscription.lastBillTimestamp);
    }
    return {
      status: ServiceResponseStatus.Success,
      data: subscription,
    };
  }

  public async create(subscription: Subscription): Promise<ServiceResponse<Subscription>> {
    subscription._id = undefined;
    if (subscription.nextBill) {
      subscription.nextBillTimestamp = subscription.nextBill.toSeconds();
    }
    if (subscription.lastBill) {
      subscription.lastBillTimestamp = subscription.lastBill.toSeconds();
    }

    if (subscription.periodicity === Periodicity.Monthly) {
      subscription.billDay = subscription.nextBill.day;
    }

    subscription.nextBill = undefined;
    subscription.lastBill = undefined;

    const insertResult = await this.subscriptionsCollection.insertOne(subscription);
    if (insertResult.acknowledged) {
      const createdSubscriptionResponse = await this.getByMongoId(insertResult.insertedId);
      if (createdSubscriptionResponse.status === ServiceResponseStatus.Success) {
        return {
          status: ServiceResponseStatus.Created,
          data: createdSubscriptionResponse.data,
        };
      } else {
        return {
          status: ServiceResponseStatus.Error,
          data: null,
        };
      }
    }
    return {
      status: ServiceResponseStatus.AlreadyExists,
      data: null,
    };
  }

  public async addUser(subscriptionMongoId: ObjectId, userMongoId: ObjectId): Promise<ServiceResponse<number>> {
    const subscriptionResponse = await this.getByMongoId(subscriptionMongoId);
    if (subscriptionResponse.status === ServiceResponseStatus.Success) {
      const subscription = subscriptionResponse.data;
      if (subscription.members?.map((x) => x.userId).includes(userMongoId)) {
        return {
          status: ServiceResponseStatus.AlreadyExists,
          data: null,
        };
      } else {
        const addResult = await this.subscriptionsCollection.updateOne(
          { _id: subscriptionMongoId },
          {
            $addToSet: {
              members: {
                userId: userMongoId,
                balance: 0,
              },
            },
          }
        );
        if (addResult.acknowledged) {
          return {
            status: ServiceResponseStatus.Created,
            data: addResult.modifiedCount,
          };
        } else {
          return {
            status: ServiceResponseStatus.Error,
            data: null,
          };
        }
      }
    } else {
      return {
        status: ServiceResponseStatus.NotFound,
        data: null,
      };
    }
  }

  public async update(subscription: Subscription): Promise<ServiceResponse<number>> {
    const updateResult = await this.subscriptionsCollection.updateOne(
      { _id: subscription._id },
      {
        $set: {
          lastBillTimestamp: subscription.lastBillTimestamp,
          nextBillTimestamp: subscription.nextBillTimestamp,
          members: subscription.members,
        },
      }
    );
    if (updateResult.acknowledged) {
      return {
        status: ServiceResponseStatus.Success,
        data: updateResult.modifiedCount,
      };
    } else {
      return {
        status: ServiceResponseStatus.Error,
        data: null,
      };
    }
  }
}
