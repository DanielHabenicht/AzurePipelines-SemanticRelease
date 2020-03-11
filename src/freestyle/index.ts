import tl = require('azure-pipelines-task-lib/task');
import tr = require('azure-pipelines-task-lib/toolrunner');
import * as path from 'path';
import semanticRelease, { GlobalConfig } from 'semantic-release';
import { Utility } from './utility/utility';

async function run() {
  const localFolder = path.join(__dirname);

  const config = Utility.getConfig();
  const taskPackageOverwrite = Utility.getTaskPackageOverwrite();
  /**
   * Installing needed NPM packages to run Semantic release
   */
  tl.debug(`Executing NPM Command in: ${localFolder}`);
  const npm = new tr.ToolRunner('npm');
  npm.line(`install --only=prod ${Utility.getNpmPackages(config, taskPackageOverwrite).join(' ')}`);
  npm
    .exec({
      cwd: localFolder
    } as any)
    .then(async () => {
      await runSemanticRelease(config);
    });
}

async function runSemanticRelease(config: GlobalConfig) {
  try {
    const result = await semanticRelease(
      { ...Utility.removeVersionFromConfig(config) },
      {
        // Run semantic-release from `/path/to/git/repo/root` without having to change local process `cwd` with `process.chdir()`
        cwd: tl.getInput('cwd'),
        // Pass the variable `MY_ENV_VAR` to semantic-release without having to modify the local `process.env`
        env: { ...process.env, ...Utility.getCredentials() },
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
