import {Component, IComponentOptions} from '@sora-soft/framework';
import {RedisError} from './RedisError';
import {RedisErrorCode} from './RedisErrorCode';
import {createNodeRedisClient, WrappedNodeRedisClient} from 'handy-redis';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const pkg: {version: string} = require('../../package.json');

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
    await this.client_.ping();
  }

  protected async disconnect() {
    await this.client.quit();
    this.client_ = null;
  }

  get client() {
    if (!this.client_)
      throw new RedisError(RedisErrorCode.ERR_COMPONENT_NOT_CONNECTED, `ERR_COMPONENT_NOT_CONNECTED, name=${this.name_}`);
    return this.client_;
  }

  async setJSON<T>(key: string, object: T, ttlMs?: number) {
    if (ttlMs)
      await this.client.set(key, JSON.stringify(object), ['PX', ttlMs]);
    else
      await this.client.set(key, JSON.stringify(object));
  }

  async getJSON<T>(key: string) {
    const content = await this.client.get(key);
    if (content)
      return JSON.parse(content) as T;
    return null;
  }

  get version() {
    return pkg.version;
  }

  private redisOptions_: IRedisComponentOptions;
  private client_: WrappedNodeRedisClient | null;
}

export {RedisComponent};
