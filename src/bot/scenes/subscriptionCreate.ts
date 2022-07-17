import config from '@/config';
import { isNumber } from '@/helpers/number';
import { ServiceResponseStatus } from '@/helpers/serviceResponse';
import { nowMidnight, tomorrowMidnight } from '@/helpers/time';
import { Subscription } from '@/models';
import { Currency } from '@/models/currency';
import { Periodicity } from '@/models/subscription';
import { DateTime } from 'luxon';
import { Composer, Scenes } from 'telegraf';
import { BotContext } from '../context';

const steps: Composer<BotContext<Subscription>>[] = [];

const dateFormat = 'dd.MM.yyyy';
const dateRegex = /^([0-2][0-9]|(3)[0-1])(\.)(((0)[0-9])|((1)[0-2]))(\.)\d{4}$/;

const step2 = new Composer<BotContext<Subscription>>();
step2.on('text', async (ctx) => {
  ctx.scene.session.data = {};
  ctx.scene.session.data.name = ctx.message.text;
  ctx.reply('Then, choose the currency', {
    reply_markup: {
      inline_keyboard: [
        [
          ...Object.values(Currency).map((currency) => ({
            text: currency.toUpperCase(),
            callback_data: `currency_${currency}`,
          })),
        ],
      ],
    },
  });
  return ctx.wizard.next();
});
steps.push(step2);

const step3 = new Composer<BotContext<Subscription>>();
Object.values(Currency).forEach((currency) => {
  step3.action(`currency_${currency}`, async (ctx) => {
    ctx.scene.session.data.currency = Currency[currency];
    ctx.replyWithHTML(`And enter the price in <b>${currency}</b>`);
    return ctx.wizard.next();
  });
});
steps.push(step3);

const step4 = new Composer<BotContext<Subscription>>();
step4.on('text', async (ctx) => {
  if (isNumber(ctx.message.text)) {
    ctx.scene.session.data.price = Number(ctx.message.text);
    ctx.reply('Choose the periodicity', {
      reply_markup: {
        inline_keyboard: [
          [
            ...Object.values(Periodicity).map((periodicity) => ({
              text: periodicity,
              callback_data: `periodicity_${periodicity}`,
            })),
          ],
        ],
      },
    });
    return ctx.wizard.next();
  } else {
    ctx.reply('Please, enter a valid number');
    return;
  }
});
steps.push(step4);

const step5 = new Composer<BotContext<Subscription>>();
Object.values(Periodicity).forEach((periodicity) => {
  step5.action(`periodicity_${periodicity}`, async (ctx) => {
    ctx.scene.session.data.periodicity = Periodicity[periodicity];
    ctx.reply(
      `Finally, enter when to start billing (e.g. ${tomorrowMidnight().toFormat(
        dateFormat
      )}, i.e. tomorrow and later) or choose from the options below`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Today',
                callback_data: 'billing_today',
              },
              {
                text: 'Tomorrow',
                callback_data: 'billing_tomorrow',
              },
            ],
          ],
        },
      }
    );
    return ctx.wizard.next();
  });
});
steps.push(step5);

const finish = async (ctx: BotContext<Subscription>) => {
  const subscriptionResponse = await ctx.subscriptionService.create(ctx.scene.session.data);
  if (subscriptionResponse.status === ServiceResponseStatus.Created) {
    const subscription = subscriptionResponse.data;
    await ctx.biller.schedule(subscription._id);
    console.log(`Success: subscription created ${subscription._id}`);
    ctx.replyWithHTML(
      `Created the following subscription:\n` +
        `Called <b>${subscription.name}</b>\n` +
        `Costs <b>${subscription.price} ${subscription.currency}</b>, billed <b>${subscription.periodicity}</b>\n` +
        `Next bill <b>${subscription.nextBill.toLocaleString(DateTime.DATE_HUGE)}</b>`
    );
  } else {
    ctx.reply('Something went wrong');
  }
};

const step6 = new Composer<BotContext<Subscription>>();
step6.action('billing_today', async (ctx) => {
  ctx.scene.session.data.nextBill = nowMidnight();
  await finish(ctx);
  return ctx.scene.leave();
});
step6.action('billing_tomorrow', async (ctx) => {
  ctx.scene.session.data.nextBill = tomorrowMidnight();
  await finish(ctx);
  return ctx.scene.leave();
});
step6.on('text', async (ctx) => {
  if (dateRegex.test(ctx.message.text)) {
    try {
      const date = DateTime.fromFormat(ctx.message.text, dateFormat);
      if (!date.isValid) {
        throw 'Invalid date';
      }
      if (date >= tomorrowMidnight()) {
        ctx.scene.session.data.nextBill = date;
        await finish(ctx);
        return ctx.scene.leave();
      } else {
        ctx.replyWithHTML(
          `Please, enter a valid date in the format of ${tomorrowMidnight().toFormat(
            dateFormat
          )} <u>starting from tomorrow</u>`
        );
        return;
      }
    } catch (e) {
      ctx.replyWithHTML(
        `Please, enter <u>a valid date</u> in the format of ${tomorrowMidnight().toFormat(
          dateFormat
        )} starting from tomorrow`
      );
      return;
    }
  } else {
    ctx.replyWithHTML(
      `Please, enter a <u>valid date</u> in the format of <u>${tomorrowMidnight().toFormat(
        dateFormat
      )}</u> starting from tomorrow`
    );
    return;
  }
});
steps.push(step6);

export const subscriptionCreateScene = new Scenes.WizardScene<BotContext>(
  config.bot.scenes.subscriptionCreate,
  async (ctx) => {
    ctx.reply("Let's create a subscription");
    ctx.reply('Firstly, enter the name');
    return ctx.wizard.next();
  },
  ...steps
);
