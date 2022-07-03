import { Scenes } from 'telegraf';
import { BotContext } from '../context';
import { subscriptionCreateScene } from './subscriptionCreate';

export const stage = new Scenes.Stage([subscriptionCreateScene]);
