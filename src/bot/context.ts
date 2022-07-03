import UserService from '@/services/userService';
import { Context } from 'telegraf';
import Container from 'typedi';

export interface BotContext extends Context {
  userService: UserService;
}

export const injectServices = (ctx: BotContext, next: () => Promise<void>) => {
  ctx.userService = Container.get(UserService);
  return next();
};
