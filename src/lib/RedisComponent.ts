import {Component, ExError, IComponentOptions, Logger, Runtime} from '@sora-soft/framework';
import {RedisError} from './RedisError.js';
import {RedisErrorCode} from './RedisErrorCode.js';
import {createClient, RedisClientType} from 'redis';
import {readFile} from 'fs/promises';
import {AssertType, ValidateClass} from '@sora-soft/type-guard';

const pkg = JSON.parse(
  await readFile(new URL('../../package.json', import.meta.url), {encoding: 'utf-8'})
) as {version: string};

export interface IRedisComponentOptions extends IComponentOptions {
  host: string;
  port: number;
  db: number;
  username?: string;
  password?: string;
  prefix: string;
}

@ValidateClass()
class RedisComponent extends Component {
  protected setOptions(@AssertType() options: IRedisComponentOptions) {
    this.redisOptions_ = options;
  }

  protected async connect() {
    this.client_ = createClient(this.redisOptions_);
    this.client_.on('error', (err: ExError) => {
      Runtime.frameLogger.error(`component.${this.name}`, err, {event: 'redis-client-error', err: Logger.errorMessage(err)});
      this.client_ = null;
    });
    await this.client_.connect();
    await this.client_.ping();
  }

  protected async disconnect() {
    await this.client.disconnect();
    this.client_ = null;
  }

  get client() {
    if (!this.client_)
      throw new RedisError(RedisErrorCode.ERR_COMPONENT_NOT_CONNECTED, `ERR_COMPONENT_NOT_CONNECTED, name=${this.name_}`);
    return this.client_;
  }

  async setJSON<T>(key: string, object: T, ttlMs?: number) {
    if (ttlMs)
      await this.client.set(key, JSON.stringify(object), {PX: ttlMs});
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
  private client_: RedisClientType | null;
}

export {RedisComponent};
