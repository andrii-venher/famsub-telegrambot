import config from '@/config';
import { ServiceResponse, ServiceResponseStatus } from '@/helpers/serviceResponse';
import { User } from '@/models';
import { Collection, ObjectId } from 'mongodb';
import { Service } from 'typedi';
import BaseService from './baseService';

@Service()
export default class UserService extends BaseService<User> {
  private usersCollection: Collection<User> = this.db.collection(config.mongo.collections.users);

  public async getById(_id: string): Promise<ServiceResponse<User>> {
    const user: User = await this.usersCollection.findOne<User>({ _id: new ObjectId(_id) });
    if (user === null) {
      return {
        status: ServiceResponseStatus.NotFound,
        data: null,
      };
    }
    return {
      status: ServiceResponseStatus.Success,
      data: user,
    };
  }

  public async create(user: User): Promise<ServiceResponse<string>> {
    user._id = undefined;
    const insertResult = await this.usersCollection.insertOne(user);
    return {
      status: ServiceResponseStatus.Created,
      data: insertResult.insertedId.toString(),
    };
  }

  public async update(user: User): Promise<ServiceResponse<User>> {
    if (!user._id) {
      return {
        status: ServiceResponseStatus.NotFound,
        data: null,
      };
    }
    const updateResult = await this.usersCollection.findOneAndUpdate({_id: user._id}, {
      $set: {
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername
      }
    })
  }
}
