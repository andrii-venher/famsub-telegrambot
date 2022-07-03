import { Db, MongoClient } from 'mongodb';
import { onShutdown } from 'node-graceful-shutdown';
import 'reflect-metadata';
import Container from 'typedi';
import bot from './bot';
import UserService from './services/userService';

async function start(): Promise<void> {
  await require('./loaders').default();

  await bot.launch();
  console.log('Success: bot started');

  console.log('Success: startup finished');
}

async function stop(): Promise<void> {
  bot.stop();
  console.log('Stop: bot stopped');
  const client: MongoClient = Container.get(MongoClient);
  await client.close();
  console.log('Stop: mongo stopped');
}

onShutdown(stop);

start();
