import { ServiceResponse, ServiceResponseStatus } from '@/helpers/serviceResponse';
import { User } from '@/models';
import UserService from '@/services/userService';
import { User as TelegramUser } from 'telegraf/typings/core/types/typegram';
import Container from 'typedi';
import { BotContext } from './context';

export function injectServices(ctx: BotContext, next: () => Promise<void>) {
  ctx.userService = Container.get(UserService);
  return next();
}

// after injectServices
export async function injectUser(ctx: BotContext, next: () => Promise<void>) {
  const telegramUser: TelegramUser = ctx.from;
  const existingUserResponse: ServiceResponse<User> = await ctx.userService.getByTelegramId(telegramUser.id);
  if (existingUserResponse.status === ServiceResponseStatus.Success) {
    ctx.user = existingUserResponse.data;
  } else {
    const userModel: User = {
      telegramId: telegramUser.id,
      telegramUsername: telegramUser.username,
      telegramFirstName: telegramUser.first_name,
      telegramLastName: telegramUser.last_name,
    };
    const createdResult = await ctx.userService.create(userModel);
    if (createdResult.status === ServiceResponseStatus.Created) {
      ctx.user = createdResult.data;
    } else {
      console.log(`Error: create user for telegramId ${telegramUser.id}`);
      ctx.user = null;
    }
  }
  return next();
}

// after injectUser
export async function updateUser(ctx: BotContext, next: () => Promise<void>) {
  const telegramUser: TelegramUser = ctx.from;
  const existingUserResponse: ServiceResponse<User> = await ctx.userService.getByTelegramId(telegramUser.id);
  if (existingUserResponse.status === ServiceResponseStatus.Success) {
    const existingUser: User = existingUserResponse.data;
    // if data is not up-to-date
    if (
      existingUser.telegramId !== telegramUser.id ||
      existingUser.telegramUsername !== telegramUser.username ||
      existingUser.telegramFirstName !== telegramUser.first_name ||
      existingUser.telegramLastName !== telegramUser.language_code
    ) {
      const userModel: User = {
        _id: existingUser._id,
        telegramId: telegramUser.id,
        telegramFirstName: telegramUser.first_name,
        telegramLastName: telegramUser.last_name,
        telegramUsername: telegramUser.username,
      };
      const updateResponse = await ctx.userService.updateTelegramData(userModel);
      if (updateResponse.status === ServiceResponseStatus.Success) {
        const existingUserResponse: ServiceResponse<User> = await ctx.userService.getByTelegramId(telegramUser.id);
        if (existingUserResponse.status === ServiceResponseStatus.Success) {
          ctx.user = existingUserResponse.data;
        } else {
          console.log(`Error: update user for telegramId ${telegramUser.id}`);
          ctx.user = null;
        }
      }
    } else {
      console.log('up-to-date');
    }
  } else {
    console.log(`Error: update user cannot find user for telegramId ${telegramUser.id}`);
    ctx.user = null;
  }
  return next();
}
