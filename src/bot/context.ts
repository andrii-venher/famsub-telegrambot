import Biller from '@/biller';
import { User } from '@/models';
import SubscriptionService from '@/services/subscriptionService';
import UserService from '@/services/userService';
import { Context } from 'telegraf';
import { SceneContextScene, WizardContextWizard, WizardSessionData } from 'telegraf/typings/scenes';

interface BotSessionData<T> extends WizardSessionData {
  data: T | null;
}

export interface BotContext<T = any> extends Context {
  scene: SceneContextScene<BotContext, BotSessionData<T>>;
  wizard: WizardContextWizard<BotContext>;
  sessionData: any | null;
  user: User | null;
  userService: UserService;
  subscriptionService: SubscriptionService;
  biller: Biller;
}
