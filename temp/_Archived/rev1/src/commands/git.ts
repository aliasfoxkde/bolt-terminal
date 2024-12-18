// src/commands/git.ts
import * as git from 'isomorphic-git';
import { FS } from '@isomorphic-git/lightning-fs';

// Use the same file system instance
const fs = new FS('bolt-fs', { wipe: false });

export const gitCommands = {
  'git-init': async () => {
    try {
      await git.init({ fs, dir: '/' });
      return 'Initialized git repository';
    } catch (error) {
      return `git init: ${error.message}`;
    }
  },

  'git-status': async () => {
    try {
      const status = await git.statusMatrix({ fs, dir: '/' });
      return status.map(([file, stage, worktree]) => {
        return `${file} ${stage}-${worktree}`;
      }).join('\n');
    } catch (error) {
      return `git status: ${error.message}`;
    }
  },

  'git-add': async (path: string) => {
    try {
      await git.add({ fs, dir: '/', filepath: path });
      return `Added ${path}`;
    } catch (error) {
      return `git add: ${error.message}`;
    }
  },

  'git-commit': async (message: string) => {
    try {
      await git.commit({
        fs,
        dir: '/',
        message,
        author: {
          name: 'User',
          email: 'user@example.com'
        }
      });
      return 'Changes committed';
    } catch (error) {
      return `git commit: ${error.message}`;
    }
  }
} as const;

export default gitCommands;
