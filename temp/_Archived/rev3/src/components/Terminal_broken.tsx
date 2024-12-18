// Vite + Remix setup for a web-based CLI using jQuery Terminal and Pyodide
import { defineConfig } from 'vite';
import remix from '@remix-run/vite';
import jquery from 'jquery';
import 'jquery.terminal';
import Pyodide from 'pyodide';
import git from 'isomorphic-git';
import fs from 'fs';

// Initialize Pyodide
async function initPyodide() {
    const pyodide = await Pyodide.loadPyodide();
    console.log('Pyodide loaded');
    return pyodide;
}

// Initialize jQuery Terminal
function initTerminal(pyodide) {
    $("#terminal").terminal(async (command, terminal) => {
        const args = command.split(/\s+/);
        const cmd = args[0];
        const params = args.slice(1);

        // Add commands here
        switch (cmd) {
            case 'python':
                try {
                    const result = await pyodide.runPython(params.join(' '));
                    terminal.echo(result);
                } catch (e) {
                    terminal.error(e.message);
                }
                break;
            case 'ls':
                terminal.echo(Object.keys(fs).join(' '));
                break;
            case 'help':
                terminal.echo('Available commands: ls, python, help');
                break;
            default:
                terminal.error(`Unknown command: ${cmd}`);
        }
    }, {
        greetings: 'Welcome to the Web CLI!',
        name: 'web_cli',
        height: 400,
        prompt: '> '
    });
}

// Git integration
function initGit() {
    git.plugins.set('fs', fs);

    async function gitStatus() {
        const status = await git.status({
            fs,
            dir: '.'
        });
        console.log(status);
    }

    return { gitStatus };
}

// Node passthrough (using Vite + Remix capabilities)
async function executeNodeCommand(command) {
    try {
        const { exec } = await import('child_process');
        exec(command, (err, stdout, stderr) => {
            if (err) console.error(stderr);
            else console.log(stdout);
        });
    } catch (e) {
        console.error('Node execution failed:', e);
    }
}

// Main setup
async function main() {
    const pyodide = await initPyodide();
    initTerminal(pyodide);
    const git = initGit();

    console.log('Git and Terminal initialized.');
}

main();
