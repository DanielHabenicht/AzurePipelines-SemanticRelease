import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';
import * as path from 'path';
import { Utility } from '../utility/utility';
import { GlobalConfig } from 'semantic-release';
import { expect } from 'chai';

const testConfig: GlobalConfig = {
  branch: 'master',
  verifyConditions: ['@semantic-release/changelog', '@semantic-release/github'],
  verifyConfig: ['@semantic-release/github'],
  prepare: [
    {
      path: '@semantic-release/changelog',
      changelogFile: 'src/changelog.md'
    }
  ],
  publish: [
    {
      path: '@semantic-release/exec',
      cmd: 'echo ##vso[build.updatebuildnumber]${nextRelease.version}'
    },
    {
      path: '@semantic-release/exec',
      cmd: 'echo ##vso[build.addbuildtag]release'
    },
    {
      path: '@semantic-release/github',
      assets: [
        {
          path: 'src/changelog.md',
          label: 'Changelog'
        }
      ]
    }
  ],
  fail: ['@semantic-release/github'],
  success: ['@semantic-release/github'],
  plugins: [['@semantic-release/commit-analyzer'], '@semantic-release/release-notes-generator']
};

describe('Sample task tests', function() {
  before(function() {});

  after(() => {});

  it('test', () => {
    expect(Utility.getNpmPackagesFromConfig(testConfig)).to.have.members([
      '@semantic-release/exec',
      '@semantic-release/github',
      '@semantic-release/commit-analyzer',
      '@semantic-release/changelog',
      '@semantic-release/release-notes-generator'
    ]);
  });

  // it('should succeed with simple inputs', function(done: MochaDone) {
  //   this.timeout(1000);

  //   let tp = path.join(__dirname, 'success.js');
  //   let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

  //   tr.run();
  //   console.log(tr.succeeded);
  //   assert.equal(tr.succeeded, true, 'should have succeeded');
  //   assert.equal(tr.warningIssues.length, 0, 'should have no warnings');
  //   assert.equal(tr.errorIssues.length, 0, 'should have no errors');
  //   console.log(tr.stdout);
  //   assert.equal(tr.stdout.indexOf('Hello human') >= 0, true, 'should display Hello human');
  //   done();
  // });

  // it('it should fail if tool returns 1', function(done: MochaDone) {
  //   this.timeout(1000);

  //   let tp = path.join(__dirname, 'failure.js');
  //   let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

  //   tr.run();
  //   console.log(tr.succeeded);
  //   assert.equal(tr.succeeded, false, 'should have failed');
  //   assert.equal(tr.warningIssues, 0, 'should have no warnings');
  //   assert.equal(tr.errorIssues.length, 1, 'should have 1 error issue');
  //   assert.equal(tr.errorIssues[0], 'Bad input was given', 'error issue output');
  //   assert.equal(tr.stdout.indexOf('Hello bad'), -1, 'Should not display Hello bad');

  //   done();
  // });
});
