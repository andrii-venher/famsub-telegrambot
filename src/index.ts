import 'reflect-metadata';

async function start() {
  await require('./loaders').default();
}

start();
