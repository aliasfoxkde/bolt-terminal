// src/components/Terminal.tsx
import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { WebglAddon } from '@xterm/addon-webgl';
import { fileSystemCommands } from '../commands/fileSystem';
import gitCommands from '../commands/git';
import pythonCommands from '../commands/python';
import { sshCommands } from '../commands/ssh';
import 'xterm/css/xterm.css';

const Terminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const commandHistory = useRef<string[]>([]);
  const historyIndex = useRef<number>(-1);

  const handleCommand = async (command: string) => {
    const term = xtermRef.current;
    if (!term) return;

    const [cmd, ...args] = command.split(' ');

    try {
      let result = '';

      // File system commands
      if (cmd in fileSystemCommands) {
        result = await fileSystemCommands[cmd](...args);
      }
      // Git commands
      else if (cmd.startsWith('git-')) {
        result = await gitCommands[cmd](...args);
      }
      // Python
      else if (cmd === 'python') {
        result = await pythonCommands.python(args.join(' '));
      }
      // SSH
      else if (cmd === 'ssh') {
        result = await sshCommands.ssh(term, args[0]);
      }
      // Built-in commands
      else switch (cmd) {
        case 'clear':
          term.clear();
          return;
        case 'help':
          result = [
            'Available commands:',
            '  File System: ls, cd, pwd, mkdir, touch, rm, cat, cp, mv',
            '  Git: git-init, git-status, git-add, git-commit',
            '  Python: python <code>',
            '  SSH: ssh <host>',
            '  Other: clear, help'
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
      term.writeln(`\r\nError: ${error.message}`);
    }
  };

  // ... rest of the Terminal component implementation remains the same
};

export default Terminal;
