// src/commands/fileSystem.ts
import { FS } from '@isomorphic-git/lightning-fs';

const fs = new FS('bolt-fs');

export const fileSystemCommands = {
  ls: async (path = '.') => {
    try {
      const files = await fs.promises.readdir(path);
      return files.join('\n');
    } catch (error) {
      return `ls: ${error.message}`;
    }
  },

  cd: async (path = '/') => {
    try {
      await fs.promises.access(path);
      process.chdir(path);
      return '';
    } catch (error) {
      return `cd: ${error.message}`;
    }
  },

  pwd: () => {
    return process.cwd();
  },

  mkdir: async (path: string) => {
    try {
      await fs.promises.mkdir(path);
      return '';
    } catch (error) {
      return `mkdir: ${error.message}`;
    }
  },

  touch: async (filename: string) => {
    try {
      await fs.promises.writeFile(filename, '');
      return '';
    } catch (error) {
      return `touch: ${error.message}`;
    }
  },

  rm: async (path: string) => {
    try {
      await fs.promises.unlink(path);
      return '';
    } catch (error) {
      return `rm: ${error.message}`;
    }
  },

  cat: async (filename: string) => {
    try {
      const content = await fs.promises.readFile(filename, 'utf8');
      return content;
    } catch (error) {
      return `cat: ${error.message}`;
    }
  },

  cp: async (source: string, dest: string) => {
    try {
      const content = await fs.promises.readFile(source);
      await fs.promises.writeFile(dest, content);
      return '';
    } catch (error) {
      return `cp: ${error.message}`;
    }
  },

  mv: async (source: string, dest: string) => {
    try {
      await fs.promises.rename(source, dest);
      return '';
    } catch (error) {
      return `mv: ${error.message}`;
    }
  }
} as const;

export default fileSystemCommands;
