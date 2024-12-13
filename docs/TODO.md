# TODO
Lists pending tasks, enhancements, and features that need implementation, serving as a prioritized 
backlog for contributors.

## Tasks
- Build and Deploy to Cloudflare Pages (v0.1.1 demo)
- After migration to Vite + React + TS, fix issues:
  - zip package fails to load, cannot import python modules
  - commands no longer work, need to fix and add switches, etc.
  - Add file explorer and ability to preview files
  - Add header with navigation
  - Add file menu at top of page
  - Add right click context menu
  - Ability to add files (drag and drop)
  - Make mobile responsive
  - Add ability to use node from the cli
  - Add themes, graphics and icons (favicon, symbols, etc)
  - Add shortcuts
  - Documentation
- More
  - Ability to change theme/layout
  - options/settings
- Terminal Window
  - Tabs (mobile responsive)
  - Shortcuts/Hotkeys
- Access to local storage?
- Sanitize input commands
- Git integration w/ wrapper
- Ability to run:
  - "shell" scripts
  - python scripts
  - node commands (install, etc)
  - node "scripts"
- Session handling for different "chats"
- Add curl, wget, and speedtest support
- Additional Command Improvements
  - cls, echo, help, alias, find, grep, ln, mv
  - command -h should provide help for that command
  - flags, like: ln -s, rm -rf, etc.
  - operations: | pipe, > redirect, >> append, etc.
- Smarts
  - tab completion
  - Simple text-based vi editor?
  - pass `*.py` script to Python "interpretter"
- Other
  - Elevation (sudo, login, etc?)
  - Improve Help
  - Syntax highlighting and terminal colors
- Networking
- Storage integration
- Migrate to Vite/Node

## Improvements
- Get access to persistent storage throug WebDav protocal

## Bugs
- Echo does not support strings with spaces (either in or out of quotes)
