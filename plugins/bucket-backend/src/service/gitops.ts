import * as express from 'express';
import { Config } from '@backstage/config';
import { Logger } from 'winston';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Git } from './git';
import { RouterOptions } from './router';
import { UrlReader } from '@backstage/backend-common';
import { convertJsonToYaml } from '../utils';

export default class GitOps {
  logger: Logger;

  config: Config;

  reader: UrlReader;

  repoUrl: string;
  repoName: string;
  accessToken: string;
  dir: string;
  isDryRun: boolean;
  branch?: string;

  git: Git;

  public constructor(options: RouterOptions) {
    const { logger, config, reader } = options;

    this.logger = logger;
    this.config = config;
    this.reader = reader;

    const gitopsConf = this.config.getConfig('gitops');

    const githubConf = this.config
      .getConfig('integrations')
      .get<[{ token: string }]>('github');

    this.repoUrl = gitopsConf.getString('repoUrl');
    this.repoName = gitopsConf.getString('repoName');
    this.dir = gitopsConf.getString('dir');
    this.branch = gitopsConf.getOptionalString('branch');
    this.isDryRun =
      gitopsConf.getOptionalString('isDryRun')?.toLocaleLowerCase() ===
        'true' || false;
    this.accessToken = githubConf[0].token;

    this.git = Git.fromAuth({
      password: this.accessToken,
      logger: this.logger,
    });
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wait until a file in git repo have desired status
   * Used to wait for kustomize process to finish updating the kustomize.yaml
   * @param dir git repo folder
   * @param filepath relative path for the file to check (e.g. path/kustomize.yaml)
   * @param status the desired git status to wait for (e.g. modified)
   * @returns True if the file found in the desired status, False if exhausted all retries
   */

  deleteStack = async (stackName: string, username: string, email: string) => {
    const suffix = (Math.random() + 1).toString(36).substring(7);
    const repoDir = path.join(os.tmpdir(), `${this.repoName}-${suffix}`);
    const author = { name: username, email };

    await this.git.clone({ url: this.repoUrl, dir: repoDir, ref: this.branch });

    const filePath = `Bucket.${stackName}.yaml`;

    await Promise.all([fs.promises.unlink(`${repoDir}/${filePath}`)]);

    await Promise.all([this.git.remove({ dir: repoDir, filepath: filePath })]);

    if (!this.isDryRun) {
      await this.git.add({ dir: repoDir, filepath: '.' });
      await this.git.commit({
        dir: repoDir,
        author: author,
        committer: author,
        message: `remove ${stackName} k8s resources`,
      });
      await this.git.push({ dir: repoDir, remote: 'origin' });
    }
  };

  public addFilesToGit = async (
    stackName: string,
    username: string,
    email: string,
    config: { [key: string]: any },
  ): Promise<{ repoDir: string; stackFile: string }> => {
    const suffix = (Math.random() + 1).toString(36).substring(7);
    const repoDir = path.join(os.tmpdir(), `${this.repoName}-${suffix}`);
    const author = { name: username, email };
this.logger.debug(`author =========> ${JSON.stringify(author)}`);
    await this.git.clone({ url: this.repoUrl, dir: repoDir, ref: this.branch });
    // TODO need to refactor the stackName when adding the full RBAC permission.
    const filePath = `${this.dir}/Bucket.${stackName}.yaml`;

    await Promise.all([
      fs.promises.writeFile(
        `${repoDir}/${filePath}`,
        convertJsonToYaml(config),
      ),
    ]);

    await this.git.add({ dir: repoDir, filepath: '.' });

    this.logger.debug(`isDryRun=${this.isDryRun}, repoDir=${repoDir}`);
    if (!this.isDryRun) {
      await this.git.commit({
        dir: repoDir,
        author: author,
        committer: author,
        message: `apply ${stackName} k8s resources`,
      });

      await this.git.push({ dir: repoDir, remote: 'origin' });
    }
    return { repoDir, stackFile: filePath };
  };

  public applyHandler: express.RequestHandler = async (req, res) => {
    const stackName = req.params.id;

    const { service, email, username, name, maxSize, maxObjects } = req.body;
    const config = { name, maxSize, maxObjects };
    this.logger.info(
      `apply stackName=${stackName}, service=${service}, username=${username}`,
    );
    try {
      await this.addFilesToGit(stackName, username, email, config);
      res.json('OK');
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      res.status(500).send(e);
    }
  };

  public deleteHandler: express.RequestHandler = async (req, res) => {
    const stackName = req.params.id;
    const username = req.params.username;
    const { service, email } = req.body;
    this.logger.debug(
      `delete stackName=${stackName}, service=${service}, username=${username}`,
    );
    try {
      await this.deleteStack(stackName, username, email);
      res.json('OK');
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      res.status(500).send(e);
    }
  };

  public listStacksHandler: express.RequestHandler = async (req, res) => {
    const username = req.params.username;
    const service = req.params.service;
    const repo = this.repoUrl.replace('.git', '');
    const search = `${repo}/tree/${
      this.branch ?? 'HEAD'
    }/**/Bucket.${username}*`;
    this.logger.debug(`search: ${search}`);
    const files = (await this.reader.search(`${search}`)).files;

    this.logger.debug(`files: ${JSON.stringify(files)}`);
    const stackNames = files.map(file =>
      file.url
        .match(/.*Bucket\.([\w|-]+)\.yaml/i)
        ?.reverse()
        .shift(),
    );
    res.json({
      username: username,
      service: service,
      count: stackNames.length,
      instances: stackNames,
    });
  };
}
