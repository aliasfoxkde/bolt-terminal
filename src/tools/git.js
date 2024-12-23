#!/usr/bin/env node

// import path from 'path-browserify';
import path from 'path';
import fs from 'fs-extra';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node/index.cjs';  // Corrected import
import minimist from 'minimist';
import { fileURLToPath } from 'url';

// Resolve __filename and __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const showHelp = () => {
  console.log(`
  Usage: git.js [command] <repository-url> [options]

  Commands:
    clone   Clone a repository
    pull    Pull changes from the remote repository
    push    Push changes to the remote repository
    status  Show the status of the working directory
    add     Add files to the staging area
    commit  Commit changes to the repository

  Options:
    --ref <branch>              Specify branch (default: main)
    -v, --version               Show version
    -h, --help                  Show help
  `);
};

const args = minimist(process.argv.slice(2), {
  string: ['ref'],
  boolean: ['version', 'v', 'help', 'h'],
  alias: { v: 'version', h: 'help' },
});

const command = args._[0] || '';
const repoUrl = args._[1];
const ref = args.ref || 'main';
const fileList = args._.slice(2); // For 'add' command, it will be file paths

const validateCommand = () => {
  if (!['clone', 'pull', 'push', 'status', 'add', 'commit', '-v', '--version', '-h', '--help'].includes(command)) {
    console.error(`Error: Unknown command "${command}".`);
    showHelp();
    process.exit(1);
  }
};

const validateRepoUrl = () => {
  if (!repoUrl && command !== 'status' && command !== 'add' && command !== 'commit') {
    console.error('Error: A repository URL must be provided for this command.');
    showHelp();
    process.exit(1);
  }
};

const runCommand = async () => {
  validateCommand();

  try {
    switch (command) {
      case 'clone': {
        validateRepoUrl();

        const repoName = path.basename(repoUrl, '.git') || 'repository';
        const dir = path.resolve(process.cwd(), repoName);

        console.log(`Cloning ${repoUrl} into ${dir}...`);
        await git.clone({ fs, http, dir, url: repoUrl });
        console.log('Clone completed successfully.');
        break;
      }

      case 'pull': {
        const dir = process.cwd();
        console.log(`Pulling changes into ${dir} on branch ${ref}...`);
        await git.pull({
          fs,
          http,
          dir,
          ref,
          singleBranch: true,
          fastForwardOnly: true,
        });
        console.log('Pull completed successfully.');
        break;
      }

      case 'push': {
        const dir = process.cwd();
        console.log(`Pushing changes from ${dir} on branch ${ref}...`);
        await git.push({ fs, http, dir, ref });
        console.log('Push completed successfully.');
        break;
      }

      case 'status': {
        const dir = process.cwd(); // Current working directory
        console.log(`Getting status for repository in ${dir}...`);
      
        // Check if the directory is a Git repository by looking for the .git folder
        const isGitRepo = fs.existsSync(path.join(dir, '.git'));
        
        if (!isGitRepo) {
          console.error('Error: This is not a git repository (no .git directory found).');
          process.exit(1);
        }
      
        try {
          // Check the status of the repository, assuming the current directory
          const status = await git.status({ fs, dir, filepath: '.' });
          console.log('Status:');
          console.log(status);
        } catch (err) {
          console.error(`Error: ${(err instanceof Error) ? err.message : 'Unknown error'}`);
          process.exit(1);
        }
        break;
      }
        
      case 'add': {
        const dir = process.cwd();
        if (fileList.length === 0) {
          console.error('Error: You must specify files to add.');
          showHelp();
          process.exit(1);
        }

        console.log(`Adding files: ${fileList.join(', ')}...`);
        await git.add({ fs, dir, filepath: fileList });
        console.log('Files added to staging area.');
        break;
      }

      case 'commit': {
        const dir = process.cwd();
        const message = args.message || args.m;
        if (!message) {
          console.error('Error: You must specify a commit message using --message or -m.');
          process.exit(1);
        }

        console.log(`Committing changes with message: "${message}"...`);
        await git.commit({ fs, dir, author: { name: 'User', email: 'user@example.com' }, message });
        console.log('Commit successful.');
        break;
      }

      case '-v':
      case '--version':
        console.log('git.js version 1.0.0');
        break;

      case '-h':
      case '--help':
      default:
        showHelp();
        break;
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

runCommand();
