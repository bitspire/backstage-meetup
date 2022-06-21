import { createRouter } from '@internal/plugin-alertmanager-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin({
  logger,
  config,
  discovery,
}: PluginEnvironment): Promise<Router> {
  return await createRouter({ logger, config, discovery });
}
