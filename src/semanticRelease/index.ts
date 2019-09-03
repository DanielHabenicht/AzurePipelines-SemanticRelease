import tl = require('azure-pipelines-task-lib/task');
import { exec } from 'child_process';
import { Utility } from './utility/utility';

async function run() {
  // function run() {
  /* for debug*/

  try {
    const inputString: string = tl.getInput('gitHubServiceName', true);
    console.log('' + inputString);
    const githubEndpoint = tl.getInput('gitHubServiceName', true);
    const githubEndpointToken = Utility.getGithubEndPointToken(githubEndpoint);
    process.env.GH_TOKEN = githubEndpointToken;

    console.log(tl.execSync('ls', ''));
    console.log(tl.execSync('cd', 'semanticRelease'));
    console.log(tl.execSync('ls', ''));
    console.log(tl.execSync('cd', '..'));

    exec('npm install semantic-release', function(code, stdout, stderr) {
      console.log('Exit code:', code);
      console.log('Program output:', stdout);
      if (stderr) {
        throw stderr;
      }

      exec(`semantic-release`, function(code, stdout, stderr) {
        console.log('Exit code:', code);
        console.log('Program output:', stdout);
        if (stderr) {
          throw stderr;
        }
      });
    });
  } catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();
