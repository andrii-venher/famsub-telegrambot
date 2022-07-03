import config from '@/config';
import { Telegraf } from 'telegraf';
import { BotContext, injectServices } from './context';

const bot = new Telegraf<BotContext>(config.bot.token);

bot.use(injectServices);

bot.on('text', (ctx) => {
  console.log(ctx.message);
});

export default bot;
