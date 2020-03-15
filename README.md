# conventional-mergebot

Squashes and merges your pull requests with a Conventional Commit message.

## Getting started

This GitHub application uses the title and description of a pull request to create a merge commit. Based on the commit message, it is possible to automatically determine the correct [SemVer](https://semver.org) version of the next release.

The generated commit message follows the pattern defined by [Conventional Commits](https://conventionalcommits.org) as you can see in the following sample:

```
feat: Introducing a cool feature.

The new feature is awesome!

BREAKING CHANGES: You must update the configuration.

#1234
```

The first line will be taken from the `title` of the pull request.

The description of the pull request (i.e. first comment) may contain several sections that will be added to the commit message.

Use section `# Details` for additional information:

```
# Details

The new feature is awesome!
```

To trigger a major release, add section `# Breaking Changes` with a description of the changes:

```
# Breaking Changes

You must update the configuration.
```

List related issues in section `# References`:

```
# References

#1234
```

For the sample commit message given above, the complete pull request description might look like:

```
# Internal Information

This text will be excluded from the commit message because of the unknown heading.

# Details

The new feature is awesome!

# Breaking Changes

You must update the configuration.

# References

#1234

# More Internal Information

This text will be excluded from the commit message, too.
```

The level of the headings does not matter. You can increase it if you prefer a smaller text size.

### Merging

Unfortunately, you cannot use the `Merge` button with this bot. To create the custom merge commit, create a new comment with the merge command:

```
/merge
```

All commits are squashed and merged using a conventional commit message. If it is not possible to create such a message, the standard message is used.

You can define a [branch protection](https://help.github.com/en/github/administering-a-repository/configuring-protected-branches) to allow only this app to merge to the master branch. This disables the `Merge` button for all members.

### Assigning reviewers

You can define rules to automatically request reviews from users or teams based on the topics and labels set for the pull request.

The rules are provided via environment variables `REVIEW_USERS_RULES` and `REVIEW_TEAMS_RULES`.

Example:

```bash
REVIEW_TEAMS_RULES = "documentation,release/major=+docs-team documentation,release/minor=-docs-team documentation=-docs-team"
```

## Deployment

This application is build using the [Probot framework](https://probot.github.io). The [documentation](https://probot.github.io/docs/deployment/) provides information about how to deploy it.

### Serverless

You can use [serverless](https://serverless.com) to deploy the application. The configuration for AWS Lambda is already included. You must only update the file `config/config.dev.json.sample`, remove its suffix `.sample`, and store the private key created by GitHub in the root folder as `private-key.pem`.

### Environment variables

- `COMMIT_CONFIG`: Config for semantic release analyzer

    Config used by default:

    ```
    {
      "preset": "angular",
      "releaseRules": [
        { "type": "chore", "release": "patch" }
      ],
      "parserOpts": {
        "noteKeywords": ["BREAKING CHANGES"]
      }
    }
    ```

- `LABEL_PREFIX`: Prefix for all created release labels
- `LABEL_SUFFIX_MAJOR`: Suffix of label for major release
- `LABEL_SUFFIX_MINOR`: Suffix of label for minor release
- `LABEL_SUFFIX_PATCH`: Suffix of label for patch release
- `REVIEW_USERS_RULES`: Space-separated list of rules for requesting reviews from users (see [Assigning reviewers](#assigning-reviewers))
- `REVIEW_TEAMS_RULES`: Space-separated list of rules for requesting reviews from teams (see [Assigning reviewers](#assigning-reviewers))
- `AUTOMERGE_BRANCHES`: Comma-separated list of branch names that will be merged automatically if all checks are ok
- `AUTOMERGE_LABEL`: Label created for branches that will be merged automatically
- `WIP_LABEL`: Label created for unfinished branches that must not be merged
