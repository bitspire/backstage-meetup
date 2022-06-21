import * as express from 'express';
import { Config } from '@backstage/config';
import { Logger } from 'winston';
import fetch from 'node-fetch';
import { IdentityClient } from '@backstage/plugin-auth-node';
import { RouterOptions } from './router';
import { InstancesResponse, BucketConfig } from '../types';

export default class Bucket {
  logger: Logger;
  config: Config;
  identity: IdentityClient | undefined;

  public constructor(options: RouterOptions) {
    const { logger, config, identity } = options;
    this.logger = logger;
    this.config = config;
    this.identity = identity;
  }
  public serviceName = 'bucket';

  public createHandler: express.RequestHandler = async (req, res) => {
    const backendUrl = this.config.getString('backend.baseUrl');
    try {
      const result = await this.createUsingPulumiK8sGitops(backendUrl, req);
      // TODO use a LocalProgram that points to the same bucket pulumi folder instead of inline program
      // const result = await this.createUsingPulumiK8sApi(backendUrl, req)
      res.json(result);
    } catch (error) {
      this.logger.error(`create handler error ${error}`);
      if (error === {}) {
        res.send({ message: 'success' });
      } else {
        res.send(error);
      }
    }
  };

  createUsingPulumiK8sGitops = async (backendUrl: string, req: any) => {
    const username = req.params.username;
    const stack = req.params.id;
    const { email, name, maxSize, maxObjects } = req.body;
    return await fetch(
      `${backendUrl}/api/pulumi/k8s/manifest/${stack}/gitops`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: req.headers.authorization as string,
        },
        body: JSON.stringify({
          service: this.serviceName,
          username,
          email,
          config: {
            name,
            maxSize,
            maxObjects,
          },
        }),
      },
    );
  };

  public listHandler: express.RequestHandler = async (req, res, next) => {
    const username = req.params.username;
    const backendUrl = this.config.getString('backend.baseUrl');

    try {
      const stacksResponse = await fetch(
        `${backendUrl}/api/pulumi/k8s/stacks/${username}/${this.serviceName}`,
        {
          method: 'get',
          headers: {
            Authorization: req.headers.authorization as string,
          },
        },
      );
      const stacks =
        (await stacksResponse.json()) as unknown as InstancesResponse;
      const allstacks = await Promise.all(
        stacks.instances.map(stack => {
          return fetch(`${backendUrl}/api/pulumi/k8s/manifest/${stack}`, {
            method: 'get',
            headers: {
              Authorization: req.headers.authorization as string,
            },
          });
        }),
      );
      const data: BucketConfig[] = await Promise.all(
        allstacks
          .filter(stack => stack.status === 200)
          .map(async stack => {
            const jsonData = await stack.json();
            const spec = jsonData.outputs?.spec?.value;
            const status =
              jsonData.outputs?.status?.value === 'Bound'
                ? 'Ready'
                : 'Pending';
            const config = jsonData.outputs?.config?.value || {};
            return {
              ...config,
              status: status,
              connect: { bucketName: spec?.bucketName, ...jsonData.outputs?.credentials?.value },
            };
          }),
      );
      res.json({
        username: username,
        service: 'bucket',
        count: data.length,
        instances: data,
      });
    } catch (error) {
      this.logger.error(`${error}`);
      next(error);
    }
  };

  public getHandler: express.RequestHandler = async (_req, _res, _next) => { };

  // FIXME remove this /gitops from the path
  public deleteHandler: express.RequestHandler = async (req, res, next) => {
    const backendUrl = this.config.getString('backend.baseUrl');
    const stack = req.params.id;
    try {
      const result = await fetch(
        `${backendUrl}/api/pulumi/k8s/manifest/${stack}/gitops`,
        {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json',
            Authorization: req.headers.authorization as string,
          },
          body: JSON.stringify({
            service: 'bucket',
          }),
        },
      );
      res.send(result.json());
    } catch (error) {
      next(error);
    }
  };
}
