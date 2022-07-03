import config from '@/config';
import { Db } from 'mongodb';
import { Telegraf } from 'telegraf';
import { session } from 'telegraf-session-mongodb';
import Container from 'typedi';
import { BotContext } from './context';
import { injectServices, injectUser, updateUser } from './middleware';
import { stage } from './scenes';

export function buildBot() {
  const bot = new Telegraf<BotContext>(config.bot.token);

  bot.use(injectServices);
  bot.use(injectUser);
  bot.use(updateUser);

  bot.use(session(Container.get(Db), { collectionName: config.mongo.collections.botSession }));
  bot.use(stage.middleware());

  bot.command('sub', (ctx) => {
    ctx.scene.enter(config.bot.scenes.subscriptionCreate);
  });

  return bot;
}
