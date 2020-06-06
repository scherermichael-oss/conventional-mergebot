## 2.0.0 (2020-06-06)

### Features


Streamline codebase ([9f39507](https://github.com/scherermichael/conventional-mergebot/commit/9f39507))

It is mainly a code cleanup to facilitate maintenance. Some features that did not fit well have been removed.


### BREAKING CHANGES

- Renamed environment variable `COMMIT_CONFIG` to `CONFIG`

- Switched to stock `angular` commit-analyzer config (https://github.com/semantic-release/commit-analyzer#configuration)

    To restore the original behaviour, set `CONFIG` to:

    ```
    {
      preset: 'angular',
      releaseRules: [
        { type: 'chore', release: 'patch' }
      ],
      parserOpts: {
        noteKeywords: ['BREAKING CHANGES']
      }
    }
    ```

- Dropped assignment of reviewers

- Removed its own rather useless commit status

## 1.1.0 (2020-06-06)

### Features


Add CicleCI config ([9f5f1cd](https://github.com/scherermichael/conventional-mergebot/commit/9f5f1cd))

