import { expect, assert } from 'chai';
import { GlobalConfig } from 'semantic-release';
import { Utility } from '../utility/utility';
import * as ttm from 'azure-pipelines-task-lib/mock-test';
const path = require('path');

describe('Remove version from packages', function() {
  it('test single function', () => {
    expect(Utility.getPackageNameWithoutVersion('@semantic-release/commit-analyzer@6.3.0')).to.equal(
      '@semantic-release/commit-analyzer'
    );
  });

  it('test config', () => {
    expect(
      Utility.removeVersionFromConfig({
        branch: 'master',
        verifyConditions: ['@semantic-release/changelog@6.3.0', '@semantic-release/github@6.3.0'],
        verifyConfig: ['@semantic-release/github@6.3.0'],
        prepare: [
          {
            path: '@semantic-release/changelog@6.3.0',
            changelogFile: 'src/changelog.md'
          }
        ],
        publish: [
          {
            path: '@semantic-release/exec@6.3.0',
            cmd: 'echo ##vso[build.updatebuildnumber]${nextRelease.version}'
          },
          {
            path: '@semantic-release/exec@6.3.0',
            cmd: 'echo ##vso[build.addbuildtag]release'
          },
          {
            path: '@semantic-release/github@6.3.0',
            assets: [
              {
                path: 'src/changelog.md',
                label: 'Changelog'
              }
            ]
          }
        ],
        fail: ['@semantic-release/github@6.3.0'],
        success: ['@semantic-release/github@6.3.0'],
        plugins: [['@semantic-release/commit-analyzer@6.3.0'], '@semantic-release/release-notes-generator@6.3.0']
      })
    ).to.deep.equal({
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
    });
  });
});

describe('Get NPM Packages', function() {
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

  it('just from config', () => {
    expect(Utility.getNpmPackages(testConfig, [])).to.have.members([
      '@semantic-release/exec',
      '@semantic-release/github',
      '@semantic-release/commit-analyzer',
      '@semantic-release/changelog',
      '@semantic-release/release-notes-generator'
    ]);
  });

  it('just from config', () => {
    expect(
      Utility.getNpmPackages(testConfig, ['@semanit-release/semantic-release@16', '@semantic-release/exec@16'])
    ).to.have.members([
      '@semanit-release/semantic-release@16',
      '@semantic-release/exec@16',
      '@semantic-release/github',
      '@semantic-release/commit-analyzer',
      '@semantic-release/changelog',
      '@semantic-release/release-notes-generator'
    ]);
  });
});

describe('Get Packages from Config String', function() {
  it('test single function', () => {
    const overridePackageString = `@semantic-release/semantic-release@16\n@semantic-release/commit-analyzer\n@semantic-release/release-notes-generator@16.3.4`;
    expect(Utility.convertMultLinePackageStringToArray(overridePackageString)).to.have.members([
      '@semantic-release/semantic-release@16',
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator@16.3.4'
    ]);
  });
});

describe('Get Package Name without Version', function() {
  it('some package names', () => {
    expect(Utility.getPackageNameWithoutVersion('@semantic-release/semantic-release@16')).to.equal(
      '@semantic-release/semantic-release'
    );
    expect(Utility.getPackageNameWithoutVersion('@semantic-release/semantic-release')).to.equal(
      '@semantic-release/semantic-release'
    );
  });
});
