import { Db, MongoClient } from 'mongodb';
import { onShutdown } from 'node-graceful-shutdown';
import 'reflect-metadata';
import { Telegraf } from 'telegraf';
import Container from 'typedi';

async function start(): Promise<void> {
  await require('./loaders').default();
  console.log('Success: DI finished');

  const bot = Container.get(Telegraf);
  await bot.launch();
  console.log('Success: bot started');

  console.log('Success: startup finished');
}

async function stop(): Promise<void> {
  const bot = Container.get(Telegraf);
  bot.stop();
  console.log('Stop: bot stopped');
  const client: MongoClient = Container.get(MongoClient);
  await client.close();
  console.log('Stop: mongo stopped');
}

onShutdown(stop);

start();
