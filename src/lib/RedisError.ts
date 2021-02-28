import {ExError} from '@sora-soft/framework';
import {RedisErrorCode} from './RedisErrorCode';

class RedisError extends ExError {
  constructor(code: RedisErrorCode, message: string) {
    super(code, message);
    Object.setPrototypeOf(this, RedisError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}


export {RedisError}
