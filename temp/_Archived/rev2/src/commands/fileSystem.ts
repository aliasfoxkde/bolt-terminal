// src/commands/fileSystem.ts
import { FS } from '@isomorphic-git/lightning-fs';

// Initialize the file system
const fs = new FS('bolt-fs', { wipe: false });
let currentDirectory = '/';

// Helper function to resolve paths
const resolvePath = (path: string) => {
  if (path.startsWith('/')) return path;
  return `${currentDirectory}/${path}`.replace(/\/\//g, '/');
};

// Initialize root directory if it doesn't exist
const initFS = async () => {
  try {
    await fs.promises.mkdir('/');
  } catch (error) {
    // Directory might already exist, that's okay
  }
};

// Initialize the file system
initFS();

export const fileSystemCommands = {
  ls: async (path = '.') => {
    try {
      const targetPath = resolvePath(path);
      const files = await fs.promises.readdir(targetPath);
      return files.join('\n');
    } catch (error) {
      return `ls: ${error.message}`;
    }
  },

  cd: async (path = '/') => {
    try {
      const targetPath = resolvePath(path);
      await fs.promises.access(targetPath);
      const stats = await fs.promises.stat(targetPath);
      if (!stats.isDirectory()) {
        return `cd: not a directory: ${path}`;
      }
      currentDirectory = targetPath;
      return '';
    } catch (error) {
      return `cd: ${error.message}`;
    }
  },

  pwd: () => {
    return currentDirectory;
  },

  mkdir: async (path: string) => {
    try {
      const targetPath = resolvePath(path);
      await fs.promises.mkdir(targetPath);
      return '';
    } catch (error) {
      return `mkdir: ${error.message}`;
    }
  },

  touch: async (filename: string) => {
    try {
      const targetPath = resolvePath(filename);
      await fs.promises.writeFile(targetPath, '');
      return '';
    } catch (error) {
      return `touch: ${error.message}`;
    }
  },

  rm: async (path: string) => {
    try {
      const targetPath = resolvePath(path);
      await fs.promises.unlink(targetPath);
      return '';
    } catch (error) {
      return `rm: ${error.message}`;
    }
  },

  cat: async (filename: string) => {
    try {
      const targetPath = resolvePath(filename);
      const content = await fs.promises.readFile(targetPath, { encoding: 'utf8' });
      return content;
    } catch (error) {
      return `cat: ${error.message}`;
    }
  },

  cp: async (source: string, dest: string) => {
    try {
      const sourcePath = resolvePath(source);
      const destPath = resolvePath(dest);
      const content = await fs.promises.readFile(sourcePath);
      await fs.promises.writeFile(destPath, content);
      return '';
    } catch (error) {
      return `cp: ${error.message}`;
    }
  },

  mv: async (source: string, dest: string) => {
    try {
      const sourcePath = resolvePath(source);
      const destPath = resolvePath(dest);
      const content = await fs.promises.readFile(sourcePath);
      await fs.promises.writeFile(destPath, content);
      await fs.promises.unlink(sourcePath);
      return '';
    } catch (error) {
      return `mv: ${error.message}`;
    }
  }
} as const;

export default fileSystemCommands;
