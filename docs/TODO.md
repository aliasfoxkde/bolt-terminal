# TODO
Lists pending tasks, enhancements, and features that need implementation, serving as a prioritized 
backlog for contributors.

## Tasks
- [ ] Build and Deploy to Cloudflare Pages (v0.1.1 demo)
- [ ] After migration to Vite + React + TS, fix issues:
  - [x] zip package fails to load, cannot import python modules
  - [ ] commands no longer work, need to fix and add switches, etc.
    - [ ] ls
    - [ ] cd
    - [ ] pwd
    - [ ] mkdir
    - [ ] touch
    - [ ] rm
    - [ ] cp
    - [ ] mv
    - [ ] cat
    - [ ] echo
    - [ ] python
    - [ ] help
  - [ ] Add file explorer and ability to preview files
  - [ ] Add header with navigation
  - [ ] Add file menu at top of page
  - [ ] Add right click context menu
  - [ ] Ability to add files (drag and drop)
  - [ ] Make mobile responsive
  - [ ] Add ability to use node from the cli
  - [ ] Add themes, graphics and icons (favicon, symbols, etc)
  - [ ] Add shortcuts
  - [ ] Documentation
- [ ] More
  - [ ] Ability to change theme/layout
  - [ ] options/settings
- [ ] Terminal Window
  - [ ] Tabs (mobile responsive)
  - [ ] Shortcuts/Hotkeys
- [ ] Access to local storage?
- [ ] Sanitize input commands
- [ ] Git integration w/ wrapper
- [ ] Ability to run:
  - [ ] "shell" scripts
  - [ ] python scripts
  - [ ] node commands (install, etc)
  - [ ] node "scripts"
- [ ] Session handling for different "chats"
- [ ] Add curl, wget, and speedtest support
- [ ] Additional Command Improvements
  - [ ] cls, echo, help, alias, find, grep, ln, mv
  - [ ] command -h should provide help for that command
  - [ ] flags, like: ln -s, rm -rf, etc.
  - [ ] operations: | pipe, > redirect, >> append, etc.
- [ ] Smarts
  - [ ] tab completion
  - [ ] Simple text-based vi editor?
  - [ ] pass `*.py` script to Python "interpretter"
- [ ] Other
  - [ ] Elevation (sudo, login, etc?)
  - [ ] Improve Help
  - [ ] Syntax highlighting and terminal colors
- [ ] Networking
- [ ] Storage integration
- [ ] Migrate to Vite/Node

## New Features

### Helix Editor Integration

-   [ ] Integrate the Helix Editor into the terminal.
    -   [ ] Research how to embed Helix Editor within a web application.
    -   [ ] Create a new command `vi` that launches the Helix Editor.
    -   [ ] Implement file opening and saving functionality within the editor.
    -   [ ] Ensure proper handling of editor events (e.g., save, close).
-   [ ] Allow users to launch the editor using the "vi" command.
-   [ ] Ensure seamless interaction between the editor and the terminal.
    -   [ ] Pass the current terminal's context (e.g., current directory) to the editor.
    -   [ ] Allow the editor to execute terminal commands (e.g., for saving files).

### Isomorphic-Git Integration

-   [ ] Integrate `isomorphic-git` to provide Git functionality within the terminal.
    -   [ ] Research `isomorphic-git` API and usage examples.
    -   [ ] Create a wrapper module for `isomorphic-git` to simplify its usage within the terminal.
    -   [ ] Implement error handling and user feedback for Git operations.
-   [ ] Implement the following core Git commands:
    -   [ ] `git clone`
        -   [ ] Implement `git clone` command with support for remote URLs.
        -   [ ] Handle authentication for private repositories.
    -   [ ] `git pull`
        -   [ ] Implement `git pull` to fetch and merge changes from a remote branch.
        -   [ ] Handle merge conflicts gracefully.
    -   [ ] `git commit`
        -   [ ] Implement `git commit` to create a new commit.
        -   [ ] Allow users to enter commit messages.
    -   [ ] `git add`
        -   [ ] Implement `git add` to stage changes for commit.
        -   [ ] Support adding specific files or all changes.
    -   [ ] `git status`
        -   [ ] Implement `git status` to display the working tree status.
        -   [ ] Show modified, staged, and untracked files.
    -   [ ] `git push`
        -   [ ] Implement `git push` to upload commits to a remote repository.
        -   [ ] Handle authentication for remote repositories.
    -   [ ] `git help`
        -   [ ] Implement `git help` to provide usage information for Git commands.
-   [ ] Implement additional Git commands:
    -   [ ] `git init`
    -   [ ] `git branch`
    -   [ ] `git log`
    -   [ ] `git fetch`
    -   [ ] `git show`
    -   [ ] `git config`
    -   [ ] `git diff`
    -   [ ] `git checkout`
    -   [ ] `git stash`
    -   [ ] `git revert`
    -   [ ] `git merge`
    -   [ ] `git tag`
    -   [ ] `git rebase`

## Enhancements

### UI/UX Improvements

-   [ ] Change the terminal resize cursor to a "grab" hand.
-   [ ] Add a file and navigation menu to the top of the application.
    -   [ ] Design the layout and functionality of the file and navigation menu.
    -   [ ] Implement menu items for common actions (e.g., New File, Open File, Save, etc.).
    -   [ ] Integrate the menu with the terminal and file explorer.
-   [ ] Add an Explorer pane to the left where users can open and edit files.
    -   [ ] Design the layout and functionality of the Explorer pane.
    -   [ ] Implement file browsing and selection.
    -   [ ] Integrate the Explorer pane with the editor and terminal.
-   [ ] Improve the overall look and feel of the application.
    -   [ ] Choose a color scheme and font that are visually appealing and easy to read.
    -   [ ] Ensure consistent styling across all UI elements.
    -   [ ] Optimize the layout for different screen sizes.
-   [ ] Add the ability to preview files in the file explorer.
    -   [ ] Implement a preview pane within the file explorer.
    -   [ ] Support previewing common file types (e.g., text, images, code).
-   [ ] Implement right-click context menu options for the file menu (left) and editor (right).
    -   [ ] Design the context menu options for the file menu and editor.
    -   [ ] Implement the functionality for each context menu option.
-   [ ] Make the application mobile responsive with gestures:
    -   [ ] Design the mobile layout and navigation.
    -   [ ] Implement touch gestures for common actions (e.g., swiping, tapping).
    -   [ ] Slide to open the left menu.
    -   [ ] The left menu should open full width and be able to slide closed.
    -   [ ] The menu should be on top of everything with a hamburger menu and search box.

### Terminal Enhancements

-   [ ] Add support for running Node.js commands from the terminal.
    -   [ ] Research how to integrate Node.js with the current terminal setup.
    -   [ ] Implement a mechanism for executing Node.js commands.
    -   [ ] Ensure proper handling of Node.js output and errors.
-   [ ] Implement tab completion for commands and file paths.
    -   [ ] Research how to implement tab completion in the current terminal.
    -   [ ] Provide suggestions for commands, file paths, and command options.
-   [ ] Display the current directory in the terminal prompt (like a Linux terminal).
    -   [ ] Update the terminal prompt to include the current working directory.
-   [ ] Add the ability to interact directly with the console/DOM from the terminal.
    -   [ ] Research how to expose the console/DOM to the terminal.
    -   [ ] Implement a mechanism for executing JavaScript code in the console/DOM.

### Command Improvements

-   [ ] Fix and add switches/flags for existing commands.
-   [ ] Add new commands with appropriate switches:
    -   [ ] General: `type`, `grep`, `shell`, `bash`, `sh`, `tree`, `man`, `kill`, `head`, `ln`, `df`, `du`, `diff`, `seq`, `whoami`
        -   [ ] Implement each command with its core functionality.
        -   [ ] Add support for common switches and options.
    -   [ ] Networking: `nslookup`, `traceroute`, `ip`, `ifconfig`, `ftp`, `chmod`, `ping`
        -   [ ] Implement each command with its core functionality.
        -   [ ] Add support for common switches and options.
    -   [ ] Storage/Files: `gzip`, `tar`, `chksum`, `read`, `realpath`, `free`
        -   [ ] Implement each command with its core functionality.
        -   [ ] Add support for common switches and options.
    -   [ ] Programming Logic: `&`, `do`, `done`, `fi`, `for`, `local`, `global`, `return`, `sleep`, `wait`, `sum`
        -   [ ] Implement each command with its core functionality.
        -   [ ] Add support for common switches and options.
    -   [ ] Other/Custom: `date`, `time`, `speedcheck`, `vi` (Helix Editor), `curl`, `wget`
        -   [ ] Implement each command with its core functionality.
        -   [ ] Add support for common switches and options.

## Bug Fixes

### Python Module Loading

-   [ ] Shell Comands are not working in terminal (executing ls, cd, etc. appear to do nothing)
-   [ ] The terminal does not display the current path
-   [x] Fix the issue where Python modules (e.g., `requests`) cannot be imported in the Pyodide environment.
    -   [x] Research the cause of the module loading issue.
    -   [x] Implement a solution to ensure that modules can be imported correctly.
    -   [x] Test the solution with various Python modules.

### Console Feedback

-   [ ] Fix the issue where feedback from commands is not showing in the console.
    -   [ ] Investigate why command output is not being displayed.
    -   [ ] Ensure that the terminal is properly capturing and displaying output from commands.
-   [ ] Ensure that appropriate error messages and usage instructions are displayed for commands like `ls`, `cp`, `cd`, etc.
    -   [ ] Review the error handling for each command.
    -   [ ] Provide clear and informative error messages.
    -   [ ] Display usage instructions when commands are used incorrectly.

### Build Errors

-   [ ] Resolve the TypeScript build error: `Cannot find type definition file for 'node'`.
    -   [ ] Research the cause of the build error.
    -   [ ] Install missing type definitions of `@types/node`.
    -   [ ] Update the TypeScript configuration if necessary.
-   [ ] Ensure that the build process completes without errors.
    -   [ ] Run the build process and verify that it completes successfully.
    -   [ ] Address any other build errors that may arise.

## Improvements
- [ ] Get access to persistent storage throug WebDav protocal

## Bugs
- [ ] Echo does not support strings with spaces (either in or out of quotes)
