/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  errorHandler,
  PluginEndpointDiscovery,
  UrlReader,
} from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { Config } from '@backstage/config';
import Bucket from './bucket';
import {
  getBearerTokenFromAuthorizationHeader,
  IdentityClient,
} from '@backstage/plugin-auth-node';
import GitOps from './gitops';

export interface RouterOptions {
  logger: Logger;
  config: Config;
  identity?: IdentityClient;
  discovery: PluginEndpointDiscovery;
  reader: UrlReader;
}

const authMiddleware =
  (identity?: IdentityClient) =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const token = getBearerTokenFromAuthorizationHeader(
      req.headers.authorization as string,
    );
    const user = (await identity?.authenticate(token))?.identity.userEntityRef;
    const username = user?.split('/')[1].replace('.', '-');
    const id = req.params.id || req.params.username;

    // This when user list all instances
    if (id === undefined && username) {
      req.params.username = username;
      next();
    } else if (username && id.startsWith(username)) {
      req.params.username = username;
      next();
    } else {
      res.send('Forbidden').status(403);
    }
  };

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, discovery } = options;
  const identity = IdentityClient.create({
    discovery,
    issuer: await discovery?.getExternalBaseUrl('auth'),
  });
  const service = new Bucket({ ...options, identity });
  const gitops = new GitOps(options);

  const router = Router();
  router.use(express.json());

  router.get('/', gitops.listStacksHandler);
  router.get('/:id', service.getHandler);
  router.put('/:id', gitops.applyHandler);
  router.delete('/:id', gitops.deleteHandler);

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.send({ status: 'ok' });
  });
  router.use(errorHandler());
  return router;
}
