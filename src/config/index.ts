import dotenv from 'dotenv';

const envFound = dotenv.config();
if (envFound.error) {
  throw new Error('Could not find .env file');
}

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

export default {
  env: process.env.NODE_ENV,
  bot: {
    token: process.env.BOT_TOKEN || '',
  },
  mongo: {
    connectionString: process.env.MONGO_CONNECTION_STRING || '',
    db: process.env.MONGO_DB_NAME || '',
    collections: {
      users: 'users',
      subscriptions: 'subscriptions',
      paymentMethods: 'paymentMethods',
      transactions: 'transactions',
    },
  },
};
