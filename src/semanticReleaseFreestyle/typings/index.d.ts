declare module 'semantic-release' {
  export default function(o: any, b: any): SemanticReleaseResult;

  // Type definitions for semantic-release 15.13
  // Project: https://github.com/semantic-release/semantic-release#readme
  // Definitions by: Leonardo Gatica <https://github.com/lgaticaq>
  // Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

  /**
   * The semantic release configuration itself.
   */
  export interface GlobalConfig {
    /**
     * The branch on which releases should happen.
     **/
    branch?: string;
    /**
     * The Git repository URL, in any supported format.
     **/
    repositoryUrl?: string;
    /**
     *  The Git tag format used by semantic-release to identify releases.
     **/
    tagFormat?: string;
    /**
     * The plugins that will be executed by semantic release
     */
    plugins?: (string | [string] | [string, any])[];
    /**
     * A Semantic Release Configuration to extend from
     */
    extends?: string;
    /**
     * Verify Config Steps
     * This will override any step defined by plugins.
     * @deprecated
     */
    verifyConfig?: any[];
    /**
     * Verify Conditions Steps
     * @deprecated
     */
    verifyConditions?: any[];
    /**
     * The full prepare step configuration.
     * @deprecated
     **/
    prepare?: any;
    /**
     * @deprecated
     */
    publish?: any;
    /**
     * @deprecated
     */
    fail?: any;
    /**
     * @deprecated
     */
    success?: any;
  }

  /**
   * The Basic Configuration of a Plugin
   */
  export interface PluginConfig {
    path: string;
    [key: string]: string;
  }

  export interface LastRelease {
    /** The version name of the release */
    version: string;
    /** The Git tag of the release. */
    gitTag: string;
    /** The Git checksum of the last commit of the release. */
    gitHead: string;
  }

  export interface NextRelease extends LastRelease {
    /** The release notes of the next release. */
    notes: string;
    type: string;
    pluginName?: any;
  }

  export interface Context {
    /** The semantic release configuration itself. */
    options?: GlobalConfig;
    /** The previous release details. */
    lastRelease?: LastRelease;
    /** The next release details. */
    nextRelease?: NextRelease;
    /** The shared logger instance of semantic release. */
    logger: {
      log: (message: string, ...vars: any[]) => void;
      error: (message: string, ...vars: any[]) => void;
    };
  }

  export interface SemanticReleaseResult {
    commits: Commit[];
    lastRelease: LastRelease;
    nextRelease: NextRelease;
    releases: NextRelease[];
  }

  export interface Commit {
    author: {
      name: string;
      email: string;
      date: Date;
    };
    body: string;
    commit: any;
    committer: any;
    committerDate: Date;
    gitTags: string;
    hash: string;
    message: string;
    subject: string;
    tree: any;
  }
}
