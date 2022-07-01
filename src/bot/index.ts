import config from '@/config';
import { Telegraf } from 'telegraf';

const bot = new Telegraf(config.bot.token);

bot.on('text', (ctx) => {
  console.log(ctx.message);
});

export default bot;
