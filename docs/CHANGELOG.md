# CHANGELOG
Chronologically records changes made to the project, including updates, fixes, and new features, 
to track progress and inform users.

v0.1.2 - Migration and Initial Enhancements
- Migrated project to Vite + React + TS
- Added basic UI structure with resizable terminal and sidebar
- Implemented initial command handling (ls, cd, pwd, mkdir, touch, rm, cp, mv, cat, echo, python, help)
- Added basic file system operations
- Integrated Pyodide for Python execution
- Added terminal resize handling
- Added sidebar resize handling
- Added fullscreen handling
- Added basic styling for terminal and UI
- Added basic error handling
- Added basic help command
- Added basic Python REPL
- Added basic command completion
- Added basic command history
- Added basic command editing
- Added basic command line editing
- Added basic command line history
- Added basic command line completion
- Added basic command line editing
- Added basic command line history
- Added basic command line completion

v0.1.1 - Initial Prototype
- Python Support through Pyodide
- Simulated terminal
- Add terminal support for commands (Initial)
  - ls, cd, mkdir, rm, echo, pwd
  - clear, touch, rmdir, cp, cat, 
  - flags, ls -a
- Fixed `rm "filename.txt"` does not work
- Versioning: Major.Minor.Bug
