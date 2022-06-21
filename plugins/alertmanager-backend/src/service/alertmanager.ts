import * as express from 'express';
import { Config } from '@backstage/config';
import { Logger } from 'winston';
import fetch from 'node-fetch';
import { RouterOptions } from './router';
import { alertmanagers } from './alerts';

type Alert = {
  cluster: string;
  fingerprint: string;
  alertname: string;
  severity: string;
  state: string;
  runbook_url: string;
  summary: string;
  labels: { [key: string]: string };
};
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

      const result: Alert[] = [];
      for (let i = 0; i < alerts.length; i++) {
        const response = await fetch(`${alerts[i].url}${apiPath}/alerts`);
        const data = await response.json();
        for (let j = 0; j < data.length; j++) {
          result.push({
            cluster: alerts[i].name,
            fingerprint: data[j].fingerprint,
            alertname: data[j].labels.alertname,
            severity: data[j].labels.severity,
            state: data[j].status.state,
            runbook_url: data[j].annotations.runbook_url,
            summary: data[j].annotations.summary,
            labels: data[j].labels,
          });
        }
      }
      this.logger.debug(`result =======> ${JSON.stringify(result)}`);
      res.json(result);
    } catch (error) {
      this.logger.debug('error =======> ', error);
      res.json(alertmanagers);
    }
  };
}

/*
cluster: clusterName,
alertname: eachAlert.labels.alertname,
severity: eachAlert.labels.severity,
state: eachAlert.status.state,
runbook_url: eachAlert.annotations.runbook_url,
summary: eachAlert.annotations.summary 
*/
