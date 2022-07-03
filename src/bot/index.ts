import config from '@/config';
import { Telegraf } from 'telegraf';
import { BotContext } from './context';
import { injectServices, injectUser, updateUser } from './middleware';

const bot = new Telegraf<BotContext>(config.bot.token);

bot.use(injectServices);
bot.use(injectUser);
bot.use(updateUser);

bot.start(async (ctx) => {
  console.log(ctx.user);
});

bot.on('text', (ctx) => {
  console.log(ctx.user);
});

export default bot;
