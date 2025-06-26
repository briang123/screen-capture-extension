# Documentation

This directory will contain dynamically generated documentation based on selected features.

# CLI Interactive Mode Gotcha

By default, the CLI (`npm run init`) runs in interactive mode and will prompt you for input in the terminal. If you run the CLI in a non-interactive environment (such as a script, CI, or via an assistant) **without** passing `--interactive=false`, it will wait for input that you cannot provide, and appear to hang.

**How to avoid this:**

- Always add `--interactive=false` when running the CLI non-interactively or when providing all options via flags.

**Example:**

```bash
npm run init -- --interactive=false --dryRun --extensionName "My Extension" --extensionDescription "A test extension"
```

If you forget this flag, the CLI will wait for input and you won't see any prompts, making it look like the process is stuck.
