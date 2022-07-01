import { Db } from 'mongodb';
import Container from 'typedi';
import mongo from './mongo';

export default async () => {
  const db = await mongo();
  Container.set(Db, db);
};
