// src/components/Terminal.tsx
import { useEffect, useRef } from 'react';
import $ from 'jquery';
import 'jquery.terminal';
import { loadPyodide } from 'pyodide';
import * as git from 'isomorphic-git';
import { FS } from '@isomorphic-git/lightning-fs';

const Terminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const fs = new FS('web-cli');
  let currentDir = '/';
  let pyodide: any = null;

  const initializePyodide = async () => {
    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.0/full/"
    });
  };

  const commands = {
    pwd: () => currentDir,
    
    cd: async (dir: string) => {
      const newPath = dir.startsWith('/') ? dir : `${currentDir}/${dir}`;
      try {
        await fs.promises.access(newPath);
        currentDir = newPath;
        return `Changed directory to ${currentDir}`;
      } catch {
        return `Directory not found: ${dir}`;
      }
    },

    ls: async (path = '.') => {
      const targetPath = path.startsWith('/') ? path : `${currentDir}/${path}`;
      try {
        const files = await fs.promises.readdir(targetPath);
        return files.join('\n');
      } catch {
        return `Cannot access ${path}`;
      }
    },

    mkdir: async (dir: string) => {
      const path = dir.startsWith('/') ? dir : `${currentDir}/${dir}`;
      try {
        await fs.promises.mkdir(path);
        return `Created directory: ${dir}`;
      } catch {
        return `Failed to create directory: ${dir}`;
      }
    },

    touch: async (filename: string) => {
      const path = filename.startsWith('/') ? filename : `${currentDir}/${filename}`;
      try {
        await fs.promises.writeFile(path, '');
        return `Created file: ${filename}`;
      } catch {
        return `Failed to create file: ${filename}`;
      }
    },

    // Git commands
    'git-init': async () => {
      try {
        await git.init({ fs, dir: currentDir });
        return 'Initialized git repository';
      } catch (error) {
        return `Git init failed: ${error}`;
      }
    },

    'git-status': async () => {
      try {
        const status = await git.status({ fs, dir: currentDir });
        return JSON.stringify(status, null, 2);
      } catch (error) {
        return `Git status failed: ${error}`;
      }
    },

    // Python execution
    python: async (code: string) => {
      if (!pyodide) {
        return 'Python runtime not initialized';
      }
      try {
        return await pyodide.runPython(code);
      } catch (error) {
        return `Python error: ${error}`;
      }
    },

    // NPM commands passthrough
    npm: async (...args: string[]) => {
      try {
        const result = await fetch('/api/npm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ args })
        });
        return await result.text();
      } catch (error) {
        return `NPM command failed: ${error}`;
      }
    },

    help: () => `
Available commands:
  System:
    pwd, cd, ls, mkdir, touch, cat, rm, cp, mv
  Git:
    git-init, git-status, git-add, git-commit, git-push, git-pull
  Development:
    python <code>, npm <command>
  Other:
    help, clear
    `
  };

  useEffect(() => {
    if (!terminalRef.current) return;

    initializePyodide();

    $(terminalRef.current).terminal(commands, {
      greetings: 'Web CLI Terminal',
      prompt: '$ ',
      completion: Object.keys(commands)
    });
  }, []);

  return <div ref={terminalRef} style={{ height: '100vh' }};></div>;
};

export default Terminal;
