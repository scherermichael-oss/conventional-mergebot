# conventional-mergebot

Squash and merge your pull requests with a Conventional Commit message.

## Getting started

[Conventional Commits](https://conventionalcommits.org) are great to automate releases without worrying about versions and changelogs. Tools such as [Semantic Release](https://github.com/semantic-release/semantic-release) use the contents of commit message to get all necessary information. But creating these commit messages is not easy, because you have to adhere strictly to the specified convention.

This GitHub application uses the title and description of a pull request to create an proper merge commit for you. This way, you can use the user-friendly editor on GitHub to compose it.

> Hint: [Pull request templates](https://help.github.com/en/github/building-a-strong-community/about-issue-and-pull-request-templates#pull-request-templates) allow new contributors to easily create correct messages.

Here you can see an example of a conventional commit message:

```
feat: Introducing a cool feature.

The new feature is awesome!

BREAKING CHANGE: You must update the configuration.

#1234
```

Let's have a look how our pull request is used to create the message above:

The first line of the commit message is taken from the `title` of the pull request.

The description of the pull request may contain several sections that are added to the commit message.

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

### Manual Merging

Unfortunately, you cannot use the `Merge` button with this bot. To create the custom merge commit, create a new comment with the merge command:

```
/merge
```

All commits are squashed and merged using a conventional commit message. If it is not possible to create such a message, the standard message is used.

> Hint: You can define a [branch protection](https://help.github.com/en/github/administering-a-repository/configuring-protected-branches) to allow only this app to merge to the master branch. This disables the `Merge` button for all members.

### Automatic merging

By setting the environment variable `AUTOMERGE_BRANCHES`, you can specify branches that will be automatically merged once all checks have been successfully completed.

### Preventing accidental merges

As long as you are still working on a pull request, you can prefix its title with `WIP:`. This prevents the bot from performing a manual or automatic merge.

### Labels

The bot creates some labels to inform users about the state of the pull request:

- The type of release that will be triggered, e.g. `release/major`. The label consists of a prefix and the type.

- The keyword used to specify the kind of changes, e.g. `release/feat`. The label also consists of the prefix and the keyword itself.

- Pull requests that must not be merged since they are still being worked on are labeled with `work-in-progress`.

- If the branch of a pull request is included in the list of branches to be merged automatically, the label `automatic-merge` is displayed.

The text of each label can be changed by setting the appropriate [environment variables](#environment-variables).

## Deployment

This application is build using the [Probot framework](https://probot.github.io). The [documentation](https://probot.github.io/docs/deployment/) provides information about how to deploy it.

### Serverless

You can use [serverless](https://serverless.com) to deploy the application. The configuration for AWS Lambda is already included. You must only update the file `config/config.dev.json.sample`, remove its suffix `.sample`, and store the private key created by GitHub in the root folder as `private-key.pem`.

### Environment variables

The bot works out of the box with sensible default settings which can be changed by environment variables.

| Variable             | Defaults                  | Description                                                                                                      |
| -------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `AUTOMERGE_BRANCHES` |                           | Comma-separated list of branch names that will be merged automatically if all checks are ok                      |
| `AUTOMERGE_LABEL`    | `automatic-merge`         | Label created for branches that will be merged automatically by the bot                                          |
| `CONFIG`             | `{ "preset": "angular" }` | Configuration for [semantic release analyzer](https://github.com/semantic-release/commit-analyzer#configuration) |
| `LABEL_PREFIX`       | `release/`                | Prefix for all created release labels; only labels created by the bot may use this prefix                        |
| `LABEL_SUFFIX_MAJOR` | `major`                   | Suffix of label for major release                                                                                |
| `LABEL_SUFFIX_MINOR` | `minor`                   | Suffix of label for minor release                                                                                |
| `LABEL_SUFFIX_PATCH` | `patch`                   | Suffix of label for patch release                                                                                |
| `WIP_LABEL`          | `work-in-progress`        | Label created for unfinished branches that must not be merged                                                    |
