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
    scenes: {
      subscriptionCreate: 'SUBSCRIPTION_CREATE_SCENE',
    },
  },
  mongo: {
    connectionString: process.env.MONGO_CONNECTION_STRING || '',
    db: process.env.MONGO_DB_NAME || '',
    collections: {
      botSession: 'bot-session',
      agenda: 'agenda-billing',
      users: 'users',
      subscriptions: 'subscriptions',
      paymentMethods: 'paymentMethods',
      transactions: 'transactions',
    },
  },
  agenda: {
    defaultLockLifetime: 1 * 60 * 1000,
    hardDelete: true,
  },
};
