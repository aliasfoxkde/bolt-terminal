# README
[Bolt-Terminal (demo here!)](https://terminal.boltdiy.com) is a project to replace the current WebContainer implimentation of the "Terminal" 
used by Bolt.New and Bolt.Diy with an open source one, so that it is easier to improve, change, and maintain. The goal is to improve 
maintaining and extend the capabilities of the terminal by adding Python support (Pyodide), Git (isomorphic-git), Node (npm & pnpm), common 
Linux commands (BusyBox as reference), Persistent storage (retained on reload using WebDav protocal standard), cloud storage integration 
(AWS, OneDrive, Mega.nz, etc), and more.

## Methodology
The core principle is to maintain a shared library of functions between the UI and Terminal, so that anything that 
can be done in the terminal can be done in the UI, and vise versa. This allows for less code, consistancy between UI 
and Terminal, ability to create and execute scripts, and gives the AI full access to the environemnt.

Additionally (WIP), the user can interact with the AI `agent` through the terminal, which allows, but is not limited to, extending the usefulness of Bolt.diy to being scriptable. These "scripts" could then be technically triggered by web workers or actions.

## Features
- [x] Interactive web-based cli terminal (using [jQuery Terminal](https://github.com/jcubic/jquery.terminal))
- [x] Python with module (pip/PyPi) support through the browser (using [pyodide](https://github.com/pyodide/pyodide))
- [ ] Git Terminal support Built-in ([isomorphic-git](https://github.com/isomorphic-git/isomorphic-git) wrapper)
- [ ] Cloud storage integration (using [WebDav](https://www.npmjs.com/package/webdav)|[Client](https://github.com/perry-mitchell/webdav-client)|[FS](https://github.com/perry-mitchell/webdav-fs))
- [ ] SSH and Telnet support (using [xterm.js](https://github.com/xtermjs/xterm.js)
- [ ] Native Node (npm, pnpm, etc.) passthrough in the Terminal.
- [ ] Advanced terminal features (using [Terminal Kit](https://github.com/cronvel/terminal-kit))
- [ ] Terminal Editor ([Helix](https://github.com/helix-editor/helix), alias `vi`)
- [ ] Color and Syntax support in Terminal (through [Supports-Color](https://github.com/chalk/supports-color))
- [ ] Persistent Storage on reload (configured with local storage)
- [ ] Execute python files in the "project" or other directories.
- [ ] Allow code in the IDE to be executed (such as with F5, Shift+F10, etc.)
- [ ] Keep persistence of changes on refresh
- [ ] Improve performance and utility.
- [ ] Ability to interact with the DOM Console and Pure JS
- [ ] Ability for AI Agent to talk to the web container.
- [ ] Consider using this as terminal with aliases?
- [ ] Standard terminal commands (ls, ln, cd, cat, mkdir, pwd, touch, rm, echo, cp, mv, curl, help, etc.)
- [ ] Isolated and Secure Environment
- [ ] Wasm hot/pre-loading and extract "modules" on first run
- [ ] Add performance buffering and caching
- [ ] ES Module Support

## Documentation  
- [README.md](#): Serves as the main entry point for the project documentation. It provides an overview of the project, including its purpose, key features, and usage instructions. It is designed to give new users and contributors a quick understanding of what the project is about and how to get started.  
- [USAGE.md](./docs/USAGE.md): Provides detailed instructions and examples on how to use the project. It serves as a comprehensive guide to help users understand and utilize the project's features effectively.  
- [PLANNING.md](./docs/PLANNING.md): Outlines the project's roadmap, goals, and key milestones. Provides an overview of the project's scope and serves as a guide for development and future enhancements.  
- [FEATURES.md](./docs/FEATURES.md): Describes the features available in the project, helping users and contributors understand its functionality, purpose, and benefits.  
- [FAQ.md](./docs/FAQ.md): Contains frequently asked questions about the project, along with answers to help users troubleshoot common issues and clarify inquiries.  
- [TODO.md](./docs/TODO.md): Lists pending tasks, enhancements, and features that need implementation, serving as a prioritized backlog for contributors.  
- [CHANGELOG.md](./docs/CHANGELOG.md): Chronologically records changes made to the project, including updates, fixes, and new features, to track progress and inform users.  
- [CONTRIBUTE.md](./docs/CONTRIBUTE.md): Guides developers and contributors interested in participating in the project. Includes setup instructions, submission guidelines, and coding standards.  
- [DEBUGGING.md](./docs/DEBUGGING.md): Helps users identify and resolve common issues encountered while using the project with step-by-step instructions and solutions.  
- [LICENSE.md](./docs/LICENSE.md): Outlines the terms of use, modification, and distribution of the project. Specifies the licensing agreement and any associated restrictions or permissions.  

## Other Porjects
- [Agentic Workflow (n8n)]()
- [Bolt.Div (maintainer)]()
- [OpenWebContainer]()
- [Automated LLM Benchmarking Tool]()
- [Scratch Optimizer]()
- [py7zip]()
- [OpenZenith]()
- [ArcPrizeSolver]()
- [Enneura]()

## Notes
-
