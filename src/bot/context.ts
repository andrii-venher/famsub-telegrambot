import { User } from '@/models';
import UserService from '@/services/userService';
import { Context } from 'telegraf';

export interface BotContext extends Context {
  user: User | null;
  userService: UserService;
}
