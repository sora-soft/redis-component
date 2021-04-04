import {Component, IComponentOptions, Runtime, Utility} from '@sora-soft/framework';
import {RedisError} from './RedisError';
import {RedisErrorCode} from './RedisErrorCode';
import {createNodeRedisClient, WrappedNodeRedisClient} from 'handy-redis';

// tslint:disable-next-line
const pkg = require('../../package.json');

export interface IRedisComponentOptions extends IComponentOptions {
  host: string;
  port: number;
  db: number;
  username?: string;
  password?: string;
  prefix: string;
}

class RedisComponent extends Component {
  protected setOptions(options: IRedisComponentOptions) {
    this.redisOptions_ = options;
  }

  protected async connect() {
    this.client_ = createNodeRedisClient(this.redisOptions_);
  }

  protected async disconnect() {
    await this.client_.quit();
    this.client_ = null;
  }

  get client() {
    if (!this.client_)
      throw new RedisError(RedisErrorCode.ERR_COMPONENT_NOT_CONNECTED, `ERR_COMPONENT_NOT_CONNECTED, name=${this.name_}`);
    return this.client_;
  }

  async setJSON(key: string, object: Object, ttlMs?: number) {
    await this.client_.set(key, JSON.stringify(object), ['PX', ttlMs]);
  }

  async getJSON(key: string) {
    const content = await this.client_.get(key);
    if (content)
      return JSON.parse(content);
    return null;
  }

  get version() {
    return pkg.version;
  }

  logOptions() {
    return Utility.hideKeys(this.redisOptions_, ['password']);
  }

  private redisOptions_: IRedisComponentOptions;
  private client_: WrappedNodeRedisClient;
}

export {RedisComponent}
