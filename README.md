# create-swift-package

Create Swift packages interactively, with flair.

## 🎁 Installation

Run `create-swift-package` with `npx`:

```bash
$ npx create-swift-package
```

or install with Yarn:

```bash
$ yarn global add create-swift-package
```

## 🧑‍💻 Usage

`create-swift-package` runs in interactive mode to prompt you to configure your targets.

There are also a couple of command-line flags which are supported:
- `--no-prompt-xcode`: When the package has been successfully created, don't prompt to open it in Xcode.
- `--no-swift-build`: By default `create-swift-package` runs `swift build` in your new package directory to validate that it has been set up correctly. Disable this check with this flag.
- `--dry-run`: Do everything apart from actually creating the package and files.

## 🙋‍♂️ FAQ

### Why isn't this written in Swift?

Swift is great for lots of things, but this is a good case of using the right tool for the job. `create-swift-package` is built using some great `npm` packages including [prompts](https://github.com/terkelg/prompts) and [ora](https://github.com/sindresorhus/ora) for its interactivity, which would have been much harder to do in Swift.
