import config from '@/config';
import { Db, MongoClient } from 'mongodb';

const client: MongoClient = new MongoClient(config.mongo.connectionString);

interface MongoStart {
  client: MongoClient;
  db: Db;
}

export default async (): Promise<MongoStart> => {
  await client.connect();
  const db: Db = client.db(config.mongo.db);
  console.log(`Success: connected to db ${config.mongo.db}`);
  return {
    client,
    db,
  };
};
