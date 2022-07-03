export enum ServiceResponseStatus {
  Success = 'success',
  NotFound = 'not_found',
  Created = 'created',
  AlreadyExists = 'already_exists',
  Problem = 'problem',
}

export interface ServiceResponse<T> {
  status: ServiceResponseStatus;
  data: T | null;
}
