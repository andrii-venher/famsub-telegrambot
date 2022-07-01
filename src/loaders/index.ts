import { Db, MongoClient } from 'mongodb';
import Container from 'typedi';
import mongo from './mongo';

export default async () => {
  const mongoStart = await mongo();
  Container.set(MongoClient, mongoStart.client);
  Container.set(Db, mongoStart.db);
};
