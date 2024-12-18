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

  useEffect(() => {
    if (!terminalRef.current) return;

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
        // Add more commands here
        break;

      case 'clear':
        term.clear();
        break;

      case 'echo':
        term.writeln(`\r\n${args.join(' ')}`);
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
