import Biller from '@/biller';
import { buildBot } from '@/bot';
import { Db, MongoClient } from 'mongodb';
import { Telegraf } from 'telegraf';
import Container from 'typedi';
import mongo from './mongo';

export default async () => {
  const mongoStart = await mongo();
  Container.set(MongoClient, mongoStart.client);
  Container.set(Db, mongoStart.db);
  const biller = Container.get(Biller);
  await biller.start();
  const bot = await buildBot();
  Container.set(Telegraf, bot);
};
