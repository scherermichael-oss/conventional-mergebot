# conventional-mergebot

Squashes and merges your pull requests with a Conventional Commit message.

## Getting started

This GitHub application uses the description of a pull request to create a merge commit with a custom message. Based on such a commit message, it is possible to automatically determine the correct [SemVer](https://semver.org) version of the next release.

It can set the status of the pull request to `error` if there is not enough information to build the commit message, if wished.

The commit message follows the pattern defined by [Conventional Commits](https://conventionalcommits.org) as you can see in the following sample:

```
feat: Introducing a cool feature.

The new feature is awesome!

BREAKING CHANGES: You must update the configuration.

#1234
```

The first line will be taken from the `title` of the pull request. The following prefixes are recognized:

- `feat`

    This is used for new features. A new minor version will be released.

- `fix`

    This is used for bugfixes. A new patch version will be released.

For the rest of the commit message, the description of the pull request (i.e. first comment) is searched for the `# Details` heading:

```
# Details

The new feature is awesome!
```

You can also add a section `# Breaking Changes` to trigger a major release:

```
# Breaking Changes

You must update the configuration.
```

Issues can be listed in then`# References` section:

```
# References

#1234
```

For the sample commit message given above, the complete description might look like:

```
# Internal Information

This text will be excluded the commit message.

# Details

The new feature is awesome!

# Breaking Changes

You must update the configuration.

# References

#1234

# More Internal Information

This text will be excluded the commit message, too.
```

The level of the headings does not matter. You can increase it if you prefer smaller text.

### Merging

Unfortunately, you cannot use the `Merge` button with this bot. To create the custom merge commit, you must create a new comment with the merge command:

```
/merge
```

All previous commits are squashed and the merge is triggered. If any information is still missing, a new comment with instructions is created.

## Deployment

This application is build using the [Probot framework](https://probot.github.io). The [documentation](https://probot.github.io/docs/deployment/) provides information about how to deploy it.

### Serverless

You can use [serverless](https://serverless.com) to deploy the application. The configuration for AWS Lambda is already included. You must only edit the file `config/config.dev.json.sample`, remove its suffix `.sample`, and store the private key created by GitHub in the root folder as `private-key.pem`.

## Configuration

Besides the environment variables needed by Probot, you can define the following variable:

- `ALLOW_MANUAL_MERGE`

    If set to `true` (the default) the commit status will always be `success`.

    If set to `false`, it will be `error` if not enough information can be found to build a commit message, or `pending` otherwise. So, the merge button will never be green in order to remind you to use the `/merge` command.
