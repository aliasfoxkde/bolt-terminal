// src/components/Terminal.tsx
import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { WebglAddon } from '@xterm/addon-webgl';
import 'xterm/css/xterm.css';

const Terminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const currentDirRef = useRef<string>('/');
  const pyodideRef = useRef<any>(null);
  const fileSystemRef = useRef<{[key: string]: any}>({
    '/': {
      'home': {
        'user': {
          'documents': {},
          'downloads': {},
          'readme.txt': 'Welcome to the virtual filesystem!'
        }
      }
    }
  });

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize Pyodide
    async function initPyodide() {
      try {
        pyodideRef.current = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/dev/full/'
        });
        xtermRef.current?.writeln('\r\nPython environment ready!');
      } catch (err) {
        console.error('Failed to load Pyodide:', err);
      }
    }
    initPyodide();

    // Initialize xterm.js
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e'
      }
    });

    // Add addons
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());
    term.loadAddon(new WebglAddon());

    // Open terminal
    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;

    // Welcome message
    term.writeln('Welcome to Bolt Terminal');
    term.writeln('Type "help" for available commands');
    term.write('\r\n$ ');

    // Handle input
    let currentLine = '';
    term.onKey(({ key, domEvent }) => {
      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

      if (domEvent.keyCode === 13) { // Enter
        handleCommand(currentLine.trim());
        currentLine = '';
        term.write('\r\n$ ');
      } else if (domEvent.keyCode === 8) { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\b \b');
        }
      } else if (printable) {
        currentLine += key;
        term.write(key);
      }
    });

    // Handle window resize
    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  const resolvePath = (path: string): string => {
    if (path.startsWith('/')) return path;
    return `${currentDirRef.current}/${path}`.replace(/\/+/g, '/');
  };

  const getDirectoryContents = (path: string) => {
    const parts = path.split('/').filter(Boolean);
    let current = fileSystemRef.current;
    for (const part of parts) {
      if (!current[part]) return null;
      current = current[part];
    }
    return current;
  };

  const handleCommand = async (command: string) => {
    const term = xtermRef.current;
    if (!term) return;

    const [cmd, ...args] = command.split(' ');

    switch (cmd) {
      case 'help':
        term.writeln('\r\nAvailable commands:');
        term.writeln('  help     - Show this help message');
        term.writeln('  clear    - Clear the terminal');
        term.writeln('  echo     - Print text');
        term.writeln('  ls       - List directory contents');
        term.writeln('  cd       - Change directory');
        term.writeln('  pwd      - Print working directory');
        term.writeln('  cat      - Display file contents');
        term.writeln('  curl     - Download from URL');
        term.writeln('  mkdir    - Create a new directory');
        term.writeln('  touch    - Create a new empty file');
        term.writeln('  rm       - Remove a file or directory');
        term.writeln('  date     - Display current date and time');
        term.writeln('  whoami   - Display current user');
        term.writeln('  history  - Show command history');
        term.writeln('  python   - Run Python code (interactive mode or direct execution)');
        break;

      case 'python':
        if (!pyodideRef.current) {
          term.writeln('\r\nPython environment is not ready yet. Please wait...');
          break;
        }
        
        if (args.length === 0) {
          // Interactive Python mode
          term.writeln('\r\nPython 3.10 (Pyodide)');
          term.writeln('Type "exit()" to return to shell');
          let pythonPrompt = '>>> ';
          term.write('\r\n' + pythonPrompt);
          
          // Store the original handler
          const originalHandler = term.onKey;
          let pyCode = '';
          
          // Create new handler for Python mode
          term.onKey(({ key, domEvent }) => {
            const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
      
            if (domEvent.keyCode === 13) { // Enter
              term.write('\r\n'); // Move to new line
              
              if (pyCode.trim() === 'exit()') {
                term.write('$ ');
                term.onKey = originalHandler;
                return;
              }
      
              try {
                const result = pyodideRef.current.runPython(pyCode);
                if (result !== undefined) {
                  term.writeln(result.toString());
                }
              } catch (err: any) {
                term.writeln(err.message);
              }
      
              pyCode = '';
              term.write(pythonPrompt);
            } else if (domEvent.keyCode === 8) { // Backspace
              if (pyCode.length > 0) {
                pyCode = pyCode.slice(0, -1);
                term.write('\b \b');
              }
            } else if (printable) {
              // Don't write the character directly - let the terminal handle it
              pyCode += key;
            }
          });
        } else {
          // Execute Python code directly
          try {
            const code = args.join(' ');
            const result = pyodideRef.current.runPython(code);
            if (result !== undefined) {
              term.writeln('\r\n' + result.toString());
            }
          } catch (err: any) {
            term.writeln('\r\n' + err.message);
          }
        }
        break;

      case 'clear':
        term.clear();
        break;

      case 'echo':
        term.writeln(`\r\n${args.join(' ')}`);
        break;

      case 'ls':
        const path = args[0] ? resolvePath(args[0]) : currentDirRef.current;
        const contents = getDirectoryContents(path);
        if (contents) {
          term.writeln('\r\n' + Object.keys(contents).join('  '));
        } else {
          term.writeln('\r\nDirectory not found');
        }
        break;

      case 'cd':
        const newPath = args[0] ? resolvePath(args[0]) : '/';
        const targetDir = getDirectoryContents(newPath);
        if (targetDir) {
          currentDirRef.current = newPath;
        } else {
          term.writeln('\r\nDirectory not found');
        }
        break;

      case 'pwd':
        term.writeln(`\r\n${currentDirRef.current}`);
        break;

      case 'cat':
        if (!args[0]) {
          term.writeln('\r\nPlease specify a file');
          break;
        }
        const filePath = resolvePath(args[0]);
        const file = getDirectoryContents(filePath);
        if (typeof file === 'string') {
          term.writeln(`\r\n${file}`);
        } else {
          term.writeln('\r\nFile not found or is a directory');
        }
        break;

      case 'curl':
        if (!args[0]) {
          term.writeln('\r\nPlease specify a URL');
          break;
        }
        try {
          term.writeln('\r\nFetching...');
          const response = await fetch(args[0]);
          const text = await response.text();
          term.writeln(text);
        } catch (error) {
          term.writeln('\r\nError fetching URL');
        }
        break;
      case 'mkdir':
        if (!args[0]) {
          term.writeln('\r\nPlease specify a directory name');
          break;
        }
        const newDirPath = resolvePath(args[0]);
        let current = fileSystemRef.current;
        const parts = newDirPath.split('/').filter(Boolean);
        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]];
          if (!current) {
            term.writeln('\r\nParent directory does not exist');
            break;
          }
        }
        current[parts[parts.length - 1]] = {};
        term.writeln('\r\nDirectory created');
        break;

      case 'touch':
        if (!args[0]) {
          term.writeln('\r\nPlease specify a file name');
          break;
        }
        const newFilePath = resolvePath(args[0]);
        current = fileSystemRef.current;
        const fileParts = newFilePath.split('/').filter(Boolean);
        for (let i = 0; i < fileParts.length - 1; i++) {
          current = current[fileParts[i]];
          if (!current) {
            term.writeln('\r\nParent directory does not exist');
            break;
          }
        }
        current[fileParts[fileParts.length - 1]] = '';
        term.writeln('\r\nFile created');
        break;

      case 'rm':
        if (!args[0]) {
          term.writeln('\r\nPlease specify a file or directory');
          break;
        }
        const rmPath = resolvePath(args[0]);
        const rmParts = rmPath.split('/').filter(Boolean);
        current = fileSystemRef.current;
        for (let i = 0; i < rmParts.length - 1; i++) {
          current = current[rmParts[i]];
          if (!current) {
            term.writeln('\r\nPath not found');
            return;
          }
        }
        delete current[rmParts[rmParts.length - 1]];
        term.writeln('\r\nRemoved successfully');
        break;

      case 'date':
        term.writeln(`\r\n${new Date().toString()}`);
        break;

      case 'whoami':
        term.writeln('\r\nuser@bolt-terminal');
        break;

      case 'history':
        if (commandHistory.length > 0) {
          term.writeln('\r\n' + commandHistory.join('\r\n'));
        }
        break;

      case '':
        break;

      default:
        term.writeln(`\r\nCommand not found: ${cmd}`);
        break;
    }
  };

  return (
    <div 
      ref={terminalRef} 
      style={{ 
        height: '100vh',
        backgroundColor: '#1e1e1e'
      }} 
    />
  );
};

export default Terminal;
