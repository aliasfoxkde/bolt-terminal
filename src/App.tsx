import React, { useEffect, useState, useRef } from 'react';
import './styles/terminal.css';
import './styles/app.css';

function App() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const terminalRef = useRef<JQueryTerminal.JQueryTerminal | null>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    $(document).ready(() => {
      // Initialize the virtual file system
      const root = {};
      let currentDir = root;
      let currentPath = '/';

      function changeDirectory(path: string): string {
        const targetPath = resolvePath(path);
        const pathParts = targetPath.split('/').filter((part) => part !== '');
        let targetDir = root;

        for (const part of pathParts) {
          if (targetDir[part] && typeof targetDir[part] === 'object') {
            targetDir = targetDir[part];
          } else {
            throw new Error(`Directory not found: ${path}`);
          }
        }

        currentDir = targetDir;
        currentPath = targetPath;
        return '';
      }

      function resolvePath(path: string): string {
        if (path.startsWith('/')) {
          return path;
        } else {
          const currentPathParts = currentPath
            .split('/')
            .filter((part) => part !== '');
          const pathParts = path.split('/').filter((part) => part !== '');
          for (const part of pathParts) {
            if (part === '..') {
              currentPathParts.pop();
            } else if (part !== '.') {
              currentPathParts.push(part);
            }
          }
          return '/' + currentPathParts.join('/');
        }
      }

      function getFile(path: string): any {
        const targetPath = resolvePath(path);
        const pathParts = targetPath.split('/').filter((part) => part !== '');
        let target = root;

        for (const part of pathParts) {
          if (target[part] !== undefined) {
            target = target[part];
          } else {
            throw new Error(`File not found: ${path}`);
          }
        }

        return target;
      }

      const commands: { [key: string]: JQueryTerminal.CommandHandler } = {
        ls: function (...args) {
          const flags = args.filter((arg) => arg.startsWith('-'));
          const path = args.find((arg) => !arg.startsWith('-')) || '.';
          const showHidden = flags.includes('-a');

          try {
            const targetPath = resolvePath(path);
            const targetDir = getFile(targetPath);

            if (typeof targetDir === 'object') {
              let entries = Object.keys(targetDir);
              if (!showHidden) {
                entries = entries.filter((entry) => !entry.startsWith('.'));
              }
              this.echo(entries.join(' '));
            } else {
              this.echo(`${path}: Not a directory`);
            }
          } catch (error: any) {
            this.error(error.message);
          }
        },
        cd: function (path) {
          try {
            this.echo(changeDirectory(path));
          } catch (error: any) {
            this.error(error.message);
          }
        },
        pwd: function () {
          this.echo(currentPath);
        },
        mkdir: function (path) {
          try {
            const targetPath = resolvePath(path);
            const pathParts = targetPath.split('/').filter((part) => part !== '');
            const newDirName = pathParts.pop();
            const parentDir =
              pathParts.length > 0
                ? getFile(pathParts.join('/'))
                : currentDir;

            if (typeof parentDir === 'object') {
              if (!parentDir[newDirName]) {
                parentDir[newDirName] = {};
                this.echo(`Created directory ${newDirName}`);
              } else {
                this.error(`Directory ${newDirName} already exists`);
              }
            } else {
              this.error(`Cannot create directory in a non-directory`);
            }
          } catch (error: any) {
            this.error(error.message);
          }
        },
        rmdir: function (path) {
          try {
            const targetPath = resolvePath(path);
            const pathParts = targetPath.split('/').filter((part) => part !== '');
            const dirName = pathParts.pop();
            const parentDir =
              pathParts.length > 0
                ? getFile(pathParts.join('/'))
                : currentDir;

            if (typeof parentDir === 'object') {
              if (
                parentDir[dirName] &&
                typeof parentDir[dirName] === 'object'
              ) {
                if (Object.keys(parentDir[dirName]).length === 0) {
                  delete parentDir[dirName];
                  this.echo(`Removed directory ${dirName}`);
                } else {
                  this.error(`Directory ${dirName} is not empty`);
                }
              } else {
                this.error(`Directory ${dirName} not found`);
              }
            } else {
              this.error(`Cannot remove directory from a non-directory`);
            }
          } catch (error: any) {
            this.error(error.message);
          }
        },
        rm: function (path) {
          try {
            const targetPath = resolvePath(path);
            const pathParts = targetPath.split('/').filter((part) => part !== '');
            const fileName = pathParts.pop();
            const parentDir =
              pathParts.length > 0
                ? getFile(pathParts.join('/'))
                : currentDir;

            if (typeof parentDir === 'object') {
              if (
                parentDir[fileName] &&
                typeof parentDir[fileName] !== 'object'
              ) {
                delete parentDir[fileName];
                this.echo(`Removed file ${fileName}`);
              } else {
                this.error(`File ${fileName} not found`);
              }
            } else {
              this.error(`Cannot remove file from a non-directory`);
            }
          } catch (error: any) {
            this.error(error.message);
          }
        },
        touch: function (path) {
          try {
            const targetPath = resolvePath(path);
            const pathParts = targetPath.split('/').filter((part) => part !== '');
            const newFileName = pathParts.pop();
            const parentDir =
              pathParts.length > 0
                ? getFile(pathParts.join('/'))
                : currentDir;

            if (typeof parentDir === 'object') {
              if (!parentDir[newFileName]) {
                parentDir[newFileName] = '';
                this.echo(`Created file ${newFileName}`);
              } else {
                this.error(`File ${newFileName} already exists`);
              }
            } else {
              this.error(`Cannot create file in a non-directory`);
            }
          } catch (error: any) {
            this.error(error.message);
          }
        },
        echo: function (...args) {
          this.echo(args.join(' '));
        },
        cat: function (path) {
          try {
            const target = getFile(path);
            if (typeof target === 'string') {
              this.echo(target);
            } else {
              this.error(`${path}: Not a file`);
            }
          } catch (error: any) {
            this.error(error.message);
          }
        },
        python: async function () {
          this.echo('Loading Pyodide...');
          const indexURL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
          const { loadPyodide } = await import(indexURL + 'pyodide.mjs');
          const pyodide = await loadPyodide({
            indexURL,
            stdout: (text) => this.echo(text),
            stderr: (text) => this.error(text),
          });

          const pythonInterpreter = async (command: string) => {
            if (command.trim() === 'exit()') {
              this.echo('Exiting Python REPL.');
              this.set_prompt('$ ');
              currentInterpreter = shellInterpreter;
              return;
            }
            try {
              const result = await pyodide.runPythonAsync(command);
              if (result !== undefined) {
                this.echo(result);
              }
            } catch (error: any) {
              this.error(error.message);
            }
          };

          const shellPrompt = '$ ';
          const ps1 = '>>> ';
          let currentInterpreter = pythonInterpreter;

          this.set_prompt(ps1);
          this.echo('Welcome to the Pyodide REPL. Type "exit()" to quit.');

          currentInterpreter = pythonInterpreter;
        },
      };

      terminalRef.current = $('#terminal').terminal(
        {
          help: function () {
            this.echo('Available commands:');
            for (const cmd in commands) {
              this.echo(`  ${cmd}`);
            }
          },
          clear: function () {
            this.clear();
          },
          ...commands,
        },
        {
          greetings:
            'Welcome to the Bolt Terminal. Type "help" for a list of commands.',
          name: 'bolt_terminal',
          height: '100%',
          prompt: '$ ',
        }
      );

      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };

      $('#fullscreen-button').on('click', function () {
        if (layoutRef.current) {
          if (!isFullscreen) {
            if (layoutRef.current.requestFullscreen) {
              layoutRef.current.requestFullscreen();
            }
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            }
          }
        }
      });

      document.addEventListener('fullscreenchange', handleFullscreenChange);

      // Resizing Logic
      let isResizingTerminal = false;
      let isResizingSidebar = false;
      let startY = 0;
      let startX = 0;
      let startTerminalHeight = 0;
      let startSidebarWidth = 0;

      const handleMouseMove = (e: MouseEvent) => {
        if (isResizingTerminal) {
          const newHeight = startTerminalHeight - (e.clientY - startY);
          if (newHeight >= 50 && newHeight <= 700) {
            document.documentElement.style.setProperty(
              '--terminal-height',
              `${newHeight}px`
            );
            terminalRef.current?.resize();
          }
        } else if (isResizingSidebar) {
          const newWidth = startSidebarWidth + (e.clientX - startX);
          if (newWidth >= 100 && newWidth <= 500) {
            document.documentElement.style.setProperty(
              '--sidebar-width',
              `${newWidth}px`
            );
          }
        }
      };

      const handleMouseUp = () => {
        isResizingTerminal = false;
        isResizingSidebar = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      $('#terminal-bar').on('mousedown', function (e) {
        isResizingTerminal = true;
        startY = e.clientY;
        startTerminalHeight = $('#terminal-container').height() || 0;
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      });

      $('#sidebar-resize-handle').on('mousedown', function (e) {
        isResizingSidebar = true;
        startX = e.clientX;
        startSidebarWidth = sidebarRef.current?.offsetWidth || 0;
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      });

      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    });
  }, []);

  return (
    <div id="layout" className={isFullscreen ? 'fullscreen' : ''} ref={layoutRef}>
      <div id="sidebar" ref={sidebarRef}>
        <div id="sidebar-resize-handle"></div>
        {/* Sidebar content */}
      </div>
      <div id="main-content">
        <div id="editor-pane">
          {/* Editor content */}
        </div>
        <div id="terminal-bar">
          <span>Terminal</span>
          <button id="fullscreen-button">
            &#x26F6; {/* HTML symbol for fullscreen */}
          </button>
        </div>
        <div id="terminal-container">
          <div id="terminal"></div>
        </div>
      </div>
    </div>
  );
}

export default App;
