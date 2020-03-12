import tl = require('azure-pipelines-task-lib/task');
import * as fs from 'fs';
import { GlobalConfig } from 'semantic-release';

export enum ConfigType {
  filePath = 'filePath',
  inline = 'inline',
  package = 'package'
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
   * Returns all packages used in the release config.
   * @param config The Semantic Release Config
   */
  public static getNpmPackages(config: GlobalConfig, taskOverwrite: string[]): string[] {
    const packages: string[] = taskOverwrite;

    if (!config.plugins) {
      return packages;
    }

    // Get the packages used in the plugins section of the config
    config.plugins.forEach(plugin => {
      if (typeof plugin === 'string') {
        Utility.addIfNotExist(packages, plugin);
      } else {
        Utility.addIfNotExist(packages, plugin[0]);
      }
    });

    // Get the config of all individual steps used in the different steps (for old release-configs)
    const steps = ['verifyConditions', 'verifyConfig', 'prepare', 'publish', 'fail', 'success'];
    const plugins: (string | { path: string })[] = [];
    steps.forEach(step => {
      if ((config as any)[step] != undefined) {
        plugins.push(...(config as any)[step]);
      }
    });

    // Get the packages used in the steps
    plugins.forEach(plugin => {
      if (typeof plugin === 'string') {
        Utility.addIfNotExist(packages, plugin);
      } else {
        Utility.addIfNotExist(packages, plugin.path);
      }
    });

    return packages;
  }

  public static getPackageNameWithoutVersion(str: string): string {
    const match = /(.{1}.*)@/gm.exec(str);
    if (match) {
      return match[1];
    } else {
      return str;
    }
  }

  /**
   * Returns all packages used in the release config.
   * @param config The Semantic Release Config
   */
  public static removeVersionFromConfig(config: GlobalConfig): GlobalConfig {
    if (config.plugins != undefined) {
      // Get the packages used in the plugins section of the config
      config.plugins.forEach((plugin, index) => {
        if (typeof plugin === 'string') {
          // Because typescript cannot count one and one together...
          (config.plugins![index] as any) = Utility.getPackageNameWithoutVersion(plugin);
        } else if (Array.isArray(plugin)) {
          (config.plugins![index][0] as any) = Utility.getPackageNameWithoutVersion(plugin[0]);
        }
      });
    }

    // Get the config of all individual steps used in the different steps (for old release-configs)
    const steps = ['verifyConditions', 'verifyConfig', 'prepare', 'publish', 'fail', 'success'] as const;
    steps.forEach(step => {
      if (config[step] != undefined) {
        config[step]!.forEach((plugin, index) => {
          if (typeof plugin === 'string') {
            config[step]![index] = Utility.getPackageNameWithoutVersion(plugin);
          } else {
            (config[step]![index] as any).path = Utility.getPackageNameWithoutVersion(plugin.path);
          }
        });
      }
    });

    return config;
  }

  public static addIfNotExist(array: string[], add: string): void {
    if (!array.map(p => Utility.getPackageNameWithoutVersion(p)).includes(Utility.getPackageNameWithoutVersion(add))) {
      array.push(add);
    }
  }

  public static getConfig(): GlobalConfig {
    const configType: ConfigType = tl.getInput('configType', true) as ConfigType;

    switch (configType) {
      case ConfigType.filePath: {
        return JSON.parse(fs.readFileSync(tl.getPathInput('configPath', true, true), 'utf8'));
      }
      case ConfigType.inline: {
        return JSON.parse(tl.getInput('configMultiline', true));
      }
      case ConfigType.package: {
        return JSON.parse(fs.readFileSync(tl.getPathInput('configPath', true, true), 'utf8')).release;
      }
    }
  }

  public static getTaskPackageOverwrite(): string[] {
    return Utility.convertMultLinePackageStringToArray(tl.getInput('versionOverwrite', true));
  }

  public static convertMultLinePackageStringToArray(str: string) {
    return str.match(/[^\r\n]+/g) || [];
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
