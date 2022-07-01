import { BaseModel } from '@/models';
import { Db } from 'mongodb';
import { Inject, Service } from 'typedi';

@Service()
export default class BaseService<T extends BaseModel> {
  constructor(@Inject() protected db: Db = null) {}
}
