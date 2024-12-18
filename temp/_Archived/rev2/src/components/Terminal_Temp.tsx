// src/components/Terminal.tsx
import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { WebglAddon } from '@xterm/addon-webgl';
import fileSystemCommands from '../commands/fileSystem';
import gitCommands from '../commands/git';
import pythonCommands from '../commands/python';
import 'xterm/css/xterm.css';

const Terminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const commandHistory = useRef<string[]>([]);
  const historyIndex = useRef<number>(-1);
  const currentCommand = useRef<string>('');

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff',
        cursor: '#ffffff'
      }
    });

    // Add addons
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());
    
    try {
      const webgl = new WebglAddon();
      term.loadAddon(webgl);
    } catch (e) {
      console.warn('WebGL addon loading failed:', e);
    }

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
        term.write('\r\n');
        if (currentLine.trim().length > 0) {
          commandHistory.current.push(currentLine);
          historyIndex.current = commandHistory.current.length;
          handleCommand(currentLine);
        }
        currentLine = '';
        term.write('$ ');
      } else if (domEvent.keyCode === 8) { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\b \b');
        }
      } else if (domEvent.keyCode === 38) { // Up arrow
        if (historyIndex.current > 0) {
          historyIndex.current--;
          currentLine = commandHistory.current[historyIndex.current];
          term.write('\r\x1b[K$ ' + currentLine);
        }
      } else if (domEvent.keyCode === 40) { // Down arrow
        if (historyIndex.current < commandHistory.current.length) {
          historyIndex.current++;
          currentLine = commandHistory.current[historyIndex.current] || '';
          term.write('\r\x1b[K$ ' + currentLine);
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

  const handleCommand = async (command: string) => {
    const term = xtermRef.current;
    if (!term) return;

    const [cmd, ...args] = command.trim().split(' ');

    try {
      let result = '';

      // File system commands
      if (cmd in fileSystemCommands) {
        result = await fileSystemCommands[cmd as keyof typeof fileSystemCommands](...args);
      }
      // Git commands
      else if (cmd.startsWith('git-')) {
        result = await gitCommands[cmd as keyof typeof gitCommands](...args);
      }
      // Python
      else if (cmd === 'python') {
        result = await pythonCommands.python(args.join(' '));
      }
      // Built-in commands
      else switch (cmd) {
        case 'clear':
          term.clear();
          return;
        case 'help':
          result = [
            'Available commands:',
            '  File System:',
            '    ls      - List directory contents',
            '    cd      - Change directory',
            '    pwd     - Print working directory',
            '    mkdir   - Make directory',
            '    touch   - Create file',
            '    rm      - Remove file',
            '    cat     - Show file contents',
            '    cp      - Copy file',
            '    mv      - Move file',
            '',
            '  Git:',
            '    git-init    - Initialize repository',
            '    git-status  - Show repository status',
            '    git-add     - Add files to staging',
            '    git-commit  - Commit changes',
            '',
            '  Python:',
            '    python <code> - Execute Python code',
            '',
            '  Other:',
            '    clear    - Clear terminal',
            '    help     - Show this help'
          ].join('\n');
          break;
        case '':
          break;
        default:
          result = `Command not found: ${cmd}`;
      }

      if (result) {
        term.writeln(`\r\n${result}`);
      }
    } catch (error) {
      term.writeln(`\r\nError: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div 
      ref={terminalRef} 
      style={{ 
        height: '100vh',
        width: '100%',
        backgroundColor: '#1e1e1e'
      }} 
    />
  );
};

export default Terminal;
