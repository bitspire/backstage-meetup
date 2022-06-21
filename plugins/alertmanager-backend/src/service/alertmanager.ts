import * as express from 'express';
import { Config } from '@backstage/config';
import { Logger } from 'winston';
import fetch from 'node-fetch';
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
    try {
      const alertManagerConfig = this.config.getOptionalConfig('alertManager');
      const apiPath = alertManagerConfig?.getOptionalString('apiPath') || '';
      const alertsConfig =
        alertManagerConfig?.getOptionalConfigArray('alerts') || [];

      if (alertsConfig.length <= 0) {
        res.json(alertmanagers);
        return;
      }

      const alerts = alertsConfig.map(config => {
        return { name: config.getString('name'), url: config.getString('url') };
      });

      this.logger.debug(`alerts =======> ${JSON.stringify(alerts)}`);

      const result: { name: string; alerts: any[] }[] = [];
      for (let i = 0; i < alerts.length; i++) {
        const response = await fetch(`${alerts[i].url}${apiPath}/alerts`);
        const data = await response.json();

        result.push({ name: alerts[i].name, alerts: data });
      }
      this.logger.debug(`result =======> ${JSON.stringify(result)}`);
      res.json(result);
    } catch (error) {
      this.logger.debug('error =======> ', error);
      res.json(alertmanagers);
    }
  };
}
