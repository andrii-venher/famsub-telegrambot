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
      ctx.user = null;
    }
  }
  return next();
}
