import config from '@/config';
import Agenda from 'agenda';

const billingAgendaInstance = new Agenda({
  db: {
    address: `${config.mongo.connectionString}/${config.mongo.db}`,
    collection: config.mongo.collections.agenda,
  },
  defaultLockLifetime: config.agenda.defaultLockLifetime,
});

billingAgendaInstance.on('error', () => console.log('Error: biller connection error'));

export default billingAgendaInstance;
