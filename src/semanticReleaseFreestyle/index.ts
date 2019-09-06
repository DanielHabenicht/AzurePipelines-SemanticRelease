import tl = require('azure-pipelines-task-lib/task');
import tr = require('azure-pipelines-task-lib/toolrunner');
import { Utility } from './utility/utility';
import semanticRelease, { GlobalConfig } from 'semantic-release';
import * as fs from 'fs';
import * as path from 'path';

export enum ConfigType {
  filePath = 'filePath',
  inline = 'inline'
}

async function run() {
  const localFolder = path.join(__dirname);
  console.log(`Skript Folder: ${localFolder}`);
  console.log(`CWD: ${process.cwd()}`);

  const npm = new tr.ToolRunner('npm');
  npm.line('install');
  console.log(`Skript Folder: ${localFolder}`);
  npm
    .exec({
      cwd: localFolder
    } as any)
    .then(async () => {
      await runSemanticRelease();
    });
  console.log(`Skript Folder: ${localFolder}`);
}

async function runSemanticRelease() {
  try {
    const configType: ConfigType = tl.getInput('configType', true) as ConfigType;

    let semanticReleaseFreestyleOption: Partial<GlobalConfig> = {};

    if (configType === ConfigType.filePath) {
      JSON.parse(fs.readFileSync(tl.getPathInput('configPath', true, true), 'utf8'));
    } else {
      semanticReleaseFreestyleOption = JSON.parse(tl.getInput('configMultiline', true));
    }
    const githubEndpoint = tl.getInput('gitHubServiceName', true);
    const githubEndpointToken = Utility.getGithubEndPointToken(githubEndpoint);
    // const githubEndpointToken = '245345345gdfgdfg';

    const result = await semanticRelease(
      { ...semanticReleaseFreestyleOption },
      {
        // Run semantic-release from `/path/to/git/repo/root` without having to change local process `cwd` with `process.chdir()`
        cwd: tl.getInput('cwd'),
        // Pass the variable `MY_ENV_VAR` to semantic-release without having to modify the local `process.env`
        env: { ...process.env, GH_TOKEN: githubEndpointToken },
        stdout: process.stdout,
        stderr: process.stderr
      }
    );

    if (result) {
      const { lastRelease, commits, nextRelease, releases } = result;

      tl.setResult(
        tl.TaskResult.Succeeded,
        `Published ${nextRelease.type} release version ${nextRelease.version} containing ${commits.length} commits.`
      );

      for (const release of releases) {
        console.log(`The release was published with plugin "${release.pluginName}".`);
      }
    } else {
      tl.setResult(tl.TaskResult.Succeeded, 'No release published.');
    }
  } catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();
