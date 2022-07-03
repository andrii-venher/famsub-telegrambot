import config from '@/config';
import { ServiceResponse, ServiceResponseStatus } from '@/helpers/serviceResponse';
import { User } from '@/models';
import { Collection, ObjectId } from 'mongodb';
import { Service } from 'typedi';
import BaseService from './baseService';

@Service()
export default class UserService extends BaseService<User> {
  private usersCollection: Collection<User> = this.db.collection(config.mongo.collections.users);

  public async getByTelegramId(id: number): Promise<ServiceResponse<User>> {
    const user: User = await this.usersCollection.findOne<User>({ telegramId: id });
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

  public async getByMongoId(_id: ObjectId): Promise<ServiceResponse<User>> {
    const user: User = await this.usersCollection.findOne<User>({ _id: _id });
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

  public async create(user: User): Promise<ServiceResponse<User>> {
    user._id = undefined;
    const insertResult = await this.usersCollection.insertOne(user);
    if (insertResult.acknowledged) {
      const createdUserResponse = await this.getByMongoId(insertResult.insertedId);
      if (createdUserResponse.status === ServiceResponseStatus.Success) {
        return {
          status: ServiceResponseStatus.Created,
          data: createdUserResponse.data,
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

  public async updateTelegramData(user: User): Promise<ServiceResponse<User>> {
    if (!user._id) {
      return {
        status: ServiceResponseStatus.NotFound,
        data: null,
      };
    }
    const updateResult = await this.usersCollection.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          telegramId: user.telegramId,
          telegramUsername: user.telegramUsername,
          telegramFirstName: user.telegramFirstName,
          telegramLastName: user.telegramLastName,
        },
      }
    );
    if (updateResult.ok) {
      return {
        status: ServiceResponseStatus.Success,
        data: updateResult.value,
      };
    }
    return {
      status: ServiceResponseStatus.Error,
      data: null,
    };
  }
}
