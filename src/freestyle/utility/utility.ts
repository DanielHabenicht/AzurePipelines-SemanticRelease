import tl = require('azure-pipelines-task-lib/task');
import { GlobalConfig } from 'semantic-release';
import { type } from 'os';
import * as fs from 'fs';

export enum ConfigType {
  filePath = 'filePath',
  inline = 'inline'
}

export class Utility {
  public static getGithubEndPointToken(githubEndpoint: string): string {
    const githubEndpointObject = tl.getEndpointAuthorization(githubEndpoint, false);
    let githubEndpointToken: string | null = null;

    if (!!githubEndpointObject) {
      tl.debug('Endpoint scheme: ' + githubEndpointObject.scheme);

      if (githubEndpointObject.scheme === 'PersonalAccessToken') {
        githubEndpointToken = githubEndpointObject.parameters.accessToken;
      } else if (githubEndpointObject.scheme === 'OAuth') {
        // scheme: 'OAuth'
        githubEndpointToken = githubEndpointObject.parameters.AccessToken;
      } else if (githubEndpointObject.scheme) {
        throw new Error(tl.loc('InvalidEndpointAuthScheme', githubEndpointObject.scheme));
      }
    }

    if (!githubEndpointToken) {
      throw new Error(tl.loc('InvalidGitHubEndpoint', githubEndpoint));
    }

    return githubEndpointToken;
  }

  /**
   * Returns all packages used un the release config.
   * @param config The Semantic Release Config
   */
  public static getNpmPackagesFromConfig(config: GlobalConfig): string[] {
    const packages: string[] = [];

    if (!config.plugins) {
      return [];
    }

    config.plugins.forEach(plugin => {
      if (typeof plugin === 'string') {
        Utility.addIfNotExist(packages, plugin);
      } else {
        Utility.addIfNotExist(packages, plugin[0]);
      }
    });

    const steps = ['verifyConditions', 'verifyConfig', 'prepare', 'publish', 'fail', 'success'];

    const plugins: (string | { path: string })[] = [];
    steps.forEach(step => {
      if((config as any)[step] != undefined){
        plugins.push(...(config as any)[step]);
      }
    });

    plugins.forEach(plugin => {
      if (typeof plugin === 'string') {
        Utility.addIfNotExist(packages, plugin);
      } else {
        Utility.addIfNotExist(packages, plugin.path);
      }
    });

    return packages;
  }

  public static addIfNotExist(array: string[], add: string): void {
    if (!array.includes(add)) {
      array.push(add);
    }
  }

  public static getConfig(): GlobalConfig {
    const configType: ConfigType = tl.getInput('configType', true) as ConfigType;

    if (configType === ConfigType.filePath) {
      return JSON.parse(fs.readFileSync(tl.getPathInput('configPath', true, true), 'utf8'));
    } else {
      return JSON.parse(tl.getInput('configMultiline', true));
    }
  }

  public static getCredentials(): { [key: string]: string } {
    let env: any = {};

    // Docker
    let dockerServiceConnectionId = tl.getInput('dockerServiceConnection');
    if (dockerServiceConnectionId) {
      const registryAuth = tl.getEndpointAuthorization(dockerServiceConnectionId, false).parameters;
      env.DOCKER_PASSWORD = registryAuth['password'];
      env.DOCKER_USERNAME = registryAuth['username'];
    }

    // GitHub
    const gitHubServiceConnectionId = tl.getInput('gitHubServiceConnection');
    if (gitHubServiceConnectionId) {
      env.GH_TOKEN = Utility.getGithubEndPointToken(gitHubServiceConnectionId);
    }

    return env;
  }
}
