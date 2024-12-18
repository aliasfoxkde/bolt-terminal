import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { WebglAddon } from '@xterm/addon-webgl';
import 'xterm/css/xterm.css';

const Terminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const pyodideRef = useRef<any>(null);

  const initializePyodide = async () => {
    try {
      pyodideRef.current = await (window as any).loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.2/full/',
      });
      xtermRef.current?.writeln('\r\nPython environment loaded successfully!');
    } catch (err) {
      console.error('Failed to initialize Pyodide:', err);
      xtermRef.current?.writeln('\r\nError: Failed to load Python environment.');
    }
  };

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
      },
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    const webglAddon = new WebglAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.loadAddon(webglAddon);

    // Open terminal
    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;

    // Display a welcome message
    term.writeln('Welcome to Bolt Terminal');
    term.writeln('Type "help" for a list of commands.');
    term.write('\r\n$ ');

    // Handle input
    let currentLine = '';
    term.onKey(({ key, domEvent }) => {
      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

      if (domEvent.key === 'Enter') {
        handleCommand(currentLine.trim());
        currentLine = '';
        term.write('\r\n$ ');
      } else if (domEvent.key === 'Backspace') {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\b \b');
        }
      } else if (printable) {
        currentLine += key;
        term.write(key);
      }
    });

    // Resize handling
    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    // Initialize Pyodide
    initializePyodide();

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  const handleCommand = async (command: string) => {
    const term = xtermRef.current;
    if (!term) return;

    if (command === 'help') {
      term.writeln('\r\nAvailable commands:');
      term.writeln('  help - Display available commands');
      term.writeln('  python <code> - Run Python code');
      term.writeln('  clear - Clear the terminal');
      return;
    }

    if (command.startsWith('python')) {
      const code = command.replace('python', '').trim();
      if (!pyodideRef.current) {
        term.writeln('\r\nPython environment not ready.');
        return;
      }

      try {
        const result = await pyodideRef.current.runPython(code);
        term.writeln(`\r\n${result}`);
      } catch (error) {
        term.writeln(`\r\nError: ${error.message}`);
      }
      return;
    }

    if (command === 'clear') {
      term.clear();
      return;
    }

    term.writeln(`\r\nUnknown command: ${command}`);
  };

  return <div ref={terminalRef} style={{ height: '100vh', width: '100%', backgroundColor: '#1e1e1e' }} />;
};

export default Terminal;
