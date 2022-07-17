import { ServiceResponseStatus } from '@/helpers/serviceResponse';
import { needBilling, toMidnight } from '@/helpers/time';
import { Subscription } from '@/models';
import { Periodicity } from '@/models/subscription';
import SubscriptionService from '@/services/subscriptionService';
import Agenda, { Job } from 'agenda';
import { DateTime } from 'luxon';
import { ObjectId } from 'mongodb';
import Container, { Service } from 'typedi';
import billingAgendaInstance from './agenda';

@Service()
export default class Biller {
  private agenda: Agenda;
  private midnightEveryDay: string = '0 0 * * *';
  private everyHour: string = '0 * * * *';
  private everyMinute: string = '* * * * *';

  constructor() {
    this.agenda = billingAgendaInstance;
  }

  private async fetchJobs() {
    const jobs = await this.agenda.jobs();
    jobs.forEach((job: Job) => this.define(job.attrs.name));
  }

  private define(subscriptionId: string) {
    this.agenda.define(subscriptionId, this.bill);
  }

  public async start() {
    await this.agenda.start();
    await this.fetchJobs();
    console.log('Success: biller started');
  }

  public async stop() {
    await this.agenda.stop();
  }

  public async schedule(subscriptionMongoId: ObjectId) {
    const subscriptionId: string = subscriptionMongoId.toString();
    const job = this.agenda.create(subscriptionId, subscriptionId);
    job
      .repeatEvery(this.everyMinute, {
        timezone: 'utc',
        //startDate: subscription.nextBillTimestamp * 1000,
      })
      .unique({ name: subscriptionId });
    await job.save();
    this.define(subscriptionId);
  }

  public async disable(id: string): Promise<boolean> {
    const result = await this.agenda.disable({ name: id });
    return result === 1;
  }

  public async cancel(id: string): Promise<boolean> {
    const result = await this.agenda.cancel({ name: id });
    return result === 1;
  }

  private async bill(job: Job): Promise<number> {
    const subscriptionId: string = job.attrs.name;
    const subscriptionService = Container.get(SubscriptionService);
    const subscriptionResponse = await subscriptionService.getByMongoId(new ObjectId(subscriptionId));
    if (subscriptionResponse.status === ServiceResponseStatus.Success) {
      const subscription: Subscription = subscriptionResponse.data;

      let bills = 0;
      while (needBilling(subscription.nextBillTimestamp)) {
        subscription.lastBillTimestamp = subscription.nextBillTimestamp;
        subscription.nextBillTimestamp = Biller.getNextBilling(subscription);
        subscription.members?.forEach((member) => {
          // + 1 to ensure admin also pays
          member.balance -= subscription.price / (subscription.members?.length + 1);
        });
        bills++;
      }
      if (bills > 0) {
        const updateReponse = await subscriptionService.update(subscription);
        if (updateReponse.status === ServiceResponseStatus.Success) {
          job.attrs.data = subscription;
          console.log(
            `Billed ${subscription._id.toString()} for ${bills} * ${subscription.price} = ${bills * subscription.price}`
          );
        } else {
          console.log(`Error: billing agenda cannot update subscription`);
        }
      }
      return bills;
    } else {
      console.log(`Error: billing agenda cannot get subscription`);
    }
    return -1;
  }

  private static getNextBilling(subscription: Subscription): number {
    const nextBilling = DateTime.fromSeconds(subscription.nextBillTimestamp, { zone: 'utc' });
    let newNextBilling: DateTime;
    switch (subscription.periodicity) {
      case Periodicity.Monthly:
        newNextBilling = nextBilling.plus({ month: 1 });
        if (subscription.billDay > newNextBilling.daysInMonth) {
          newNextBilling = newNextBilling.set({ day: newNextBilling.daysInMonth });
        } else {
          newNextBilling = newNextBilling.set({ day: subscription.billDay });
        }
        break;
      default:
        throw new Error('Unknown billing type');
    }
    return toMidnight(newNextBilling).toUnixInteger();
  }
}
