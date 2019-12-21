[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)

# Semantic Release Task for Azure Pipelines

> This is under development and may not work as expected. Please do not use for production till 1.0 release.

This is a Azure DevOps Extension that supplies you with multiple Azure Pipelines Tasks that make your release much easier.

## How to use

There are multiple ways to use the Extension. 

### The Freestyle Task

   1. You can load the release config from three different location:
      1. File Path: The path to your `releaserc.json` or any other `json` file.
      2. Inline: An inline `json` formatted release config.
      3. Package.json: The path to your `package.json` with a release property.
   2. Credentials...

Just add the task to your Pipeline.
> Add Usage

It is utilizing [semantic-release](https://github.com/semantic-release/semantic-release). You can either use predefined tasks or hack it your way with the freestyle task. 

Provide multiple Tasks:

- Semantic Release Freestyle (using a `releaserc` file)
- Pre-Defined Tasks:
  - NPM Package
  - Just Release Notes
- Create an issue to add your idea.

More to come soon!


## Contribution

> Add Guide

## License
MIT

Made possible by the great [semantic-release](https://github.com/semantic-release/semantic-release) package.
