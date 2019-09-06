import tl = require('azure-pipelines-task-lib/task');
import { Utility } from './utility/utility';
const semanticReleaseFreestyle = require('semantic-release');
const fs = require('fs');

export enum ConfigType {
  filePath = 'filePath',
  inline = 'inline'
}

// Look for other parts of this extension here: $(Work_Folder)/_tasks/semanticReleaseFreestyleAzureTask/...

async function run() {
  try {
    const configType: ConfigType = tl.getInput('configType', true) as ConfigType;

    let semanticReleaseFreestyleOption = {};

    if (configType === ConfigType.filePath) {
      JSON.parse(fs.readFileSync(tl.getPathInput('configPath', true, true), 'utf8'));
    } else {
      semanticReleaseFreestyleOption = JSON.parse(tl.getInput('configMultiline', true));
    }
    const githubEndpoint = tl.getInput('gitHubServiceName', true);
    const githubEndpointToken = Utility.getGithubEndPointToken(githubEndpoint);
    process.env.GH_TOKEN = githubEndpointToken;

    const result = await semanticReleaseFreestyle(
      { ...semanticReleaseFreestyleOption },
      {
        // Run semantic-release from `/path/to/git/repo/root` without having to change local process `cwd` with `process.chdir()`
        cwd: tl.getInput('cwd'),
        // Pass the variable `MY_ENV_VAR` to semantic-release without having to modify the local `process.env`
        env: { ...process.env, GH_TOKEN: githubEndpointToken },
        // Store stdout and stderr to use later instead of writing to `process.stdout` and `process.stderr`
        stdout: process.stdout,
        stderr: process.stderr
      }
    );

    if (result) {
      const { lastRelease, commits, nextRelease, releases } = result;

      console.log(
        `Published ${nextRelease.type} release version ${nextRelease.version} containing ${commits.length} commits.`
      );

      if (lastRelease.version) {
        console.log(`The last release was "${lastRelease.version}".`);
      }

      for (const release of releases) {
        console.log(`The release was published with plugin "${release.pluginName}".`);
      }
    } else {
      console.log('No release published.');
    }
  } catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();
