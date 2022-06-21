import * as express from 'express';
import { Config } from '@backstage/config';
import { Logger } from 'winston';
import { RouterOptions } from './router';
import { alertmanagers } from './alerts';

export default class AlertManager {
  logger: Logger;

  config: Config;

  public constructor(options: RouterOptions) {
    const { logger, config } = options;
    this.logger = logger;
    this.config = config;
  }

  public listAlerts: express.RequestHandler = async (_, res) => {
    res.json(alertmanagers);
  };
}
