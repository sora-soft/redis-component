import {Component, IComponentOptions, Runtime} from '@sora-soft/framework';
import { ClientV3 as RedisClient } from '@camaro/redis';
import {RedisError} from './RedisError';
import {RedisErrorCode} from './RedisErrorCode';

export interface IRedisComponentOptions extends IComponentOptions {
  host: string;
  port: number;
  db: number;
  username?: string;
  password?: string;
}

class RedisComponent extends Component {
  protected setOptions(options: IRedisComponentOptions) {
    this.redisOptions_ = options;
  }

  protected async connect() {
    this.client_ = new RedisClient(this.redisOptions_);
    await this.client_.SELECT(this.redisOptions_.db);
    Runtime.frameLogger.success('component.redis', { event: 'connect', target: {host: this.redisOptions_.host, port: this.redisOptions_.port, db: this.redisOptions_.db} });
  }

  protected async disconnect() {
    // https://github.com/camarojs/redis/pull/13
    // await this.client_.QUIT();
    this.client_ = null;
    Runtime.frameLogger.success('component.redis', { event: 'disconnect', target: {host: this.redisOptions_.host, port: this.redisOptions_.port, db: this.redisOptions_.db} });
  }

  get client() {
    if (!this.client_)
      throw new RedisError(RedisErrorCode.ERR_COMPONENT_NOT_CONNECTED, `ERR_COMPONENT_NOT_CONNECTED, name=${this.name_}`);
    return this.client_;
  }

  private redisOptions_: IRedisComponentOptions;
  private client_: RedisClient;
}

export {RedisComponent}
