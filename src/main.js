import $ from 'jquery';
import '../styles/pyodide.css'; // Pyodide specific styles
import '../styles/terminal.css'; // Terminal styling
import 'jquery.terminal'; // Import the jQuery Terminal plugin
// Commenting out unless necessary: import 'jquery.terminal/js/unix_formatting.js'; 
import { loadPyodide } from 'pyodide/pyodide.mjs';
// Import Pyodide (keep your existing logic for Pyodide handling)
async function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
}
async function handlePrintScreenEvent() {
    try {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
            if (item.types.includes('image/png')) {
                const blob = await item.getType('image/png');
                downloadBlob(blob, 'screenshot.png');
                console.log('Screenshot saved as screenshot.png');
                return;
            }
        }
        console.warn('No image found on the clipboard.');
    }
    catch (error) {
        console.error('Failed to access clipboard: ', error);
    }
}
document.addEventListener('keydown', (event) => {
    if (event.key === 'PrintScreen') {
        handlePrintScreenEvent();
    }
});
async function main() {
    let indexURL = './node_modules/pyodide/v0.26.4/full/';
    const urlParams = new URLSearchParams(window.location.search);
    const buildParam = urlParams.get('build');
    if (buildParam) {
        if (['full', 'debug', 'pyc'].includes(buildParam)) {
            indexURL = indexURL.replace('/full/', `/${urlParams.get('build')}/`);
        }
        else {
            console.warn(`Invalid URL parameter: build="${buildParam}". Using default "full".`);
        }
    }
    globalThis.loadPyodide = loadPyodide;
    // Initialize terminal
    const term = await initializeTerminal();
    globalThis.pyodide = await loadPyodide({
        stdin: () => {
            let result = prompt();
            term.echo(result);
            return result;
        },
    });
    const echo = (msg, ...opts) => {
        term.echo(msg
            .replaceAll(']]', '&rsqb;&rsqb;')
            .replaceAll('[[]', '&lsqb;&lsqb;'), ...opts);
    };
    const commands = {
        ls: (flags = '') => {
            try {
                const cwd = pyodide.FS.cwd();
                const files = pyodide.FS.readdir(cwd);
                if (flags.includes('-a')) {
                    echo(files.join(' \n'));
                }
                else {
                    echo(files.filter((f) => !f.startsWith('.')).join(' \n'));
                }
            }
            catch (e) {
                echo(`Error: ${e.message}`);
            }
        },
        cd: (path) => {
            try {
                pyodide.FS.chdir(path);
            }
            catch (e) {
                echo(`Error: ${e.message}`);
            }
        },
        pwd: () => {
            echo(pyodide.FS.cwd());
        },
        mkdir: (path) => {
            try {
                pyodide.FS.mkdir(path);
            }
            catch (e) {
                echo(`Error: ${e.message}`);
            }
        },
        rmdir: (path) => {
            try {
                pyodide.FS.rmdir(path);
            }
            catch (e) {
                echo(`Error: ${e.message}`);
            }
        },
        rm: (path, flags = '') => {
            try {
                pyodide.FS.unlink(path);
            }
            catch (e) {
                echo(`Error: ${e.message}`);
            }
        },
        touch: (path) => {
            try {
                pyodide.FS.writeFile(path, '');
            }
            catch (e) {
                echo(`Error: ${e.message}`);
            }
        },
        echo: (text) => {
            echo(text);
        },
        cat: (path) => {
            try {
                const content = pyodide.FS.readFile(path, { encoding: 'utf8' });
                echo(content);
            }
            catch (e) {
                echo(`Error: ${e.message}`);
            }
        },
        help: () => {
            echo("Available commands: ls, cd, pwd, mkdir, rmdir, rm, touch, echo, cat, python");
        },
        python: () => {
            echo('Welcome to the Pyodide terminal emulator 🐍');
        },
    };
    const shellInterpreter = async (command) => {
        const [cmd, ...args] = command.split(/\s+/);
        if (commands[cmd]) {
            commands[cmd](...args);
        }
        else {
            echo(`Unknown command: ${cmd}. Type 'help' for a list of commands.`);
        }
    };
    const pythonInterpreter = async (command) => {
        if (command.trim() === 'exit()') {
            echo('Exiting Python REPL.');
            term.set_prompt(shellPrompt);
            currentInterpreter = shellInterpreter;
            return;
        }
        const fut = pyconsole.push(command);
        switch (fut.syntax_check) {
            case 'syntax-error':
                term.error(fut.formatted_error.trimEnd());
                break;
            case 'complete':
                try {
                    const [value] = await await_fut(fut);
                    if (value !== undefined) {
                        echo(String(value));
                    }
                }
                catch (e) {
                    term.error(e.message);
                }
                break;
        }
    };
    const shellPrompt = '$ ';
    const ps1 = '>>> ';
    let currentInterpreter = shellInterpreter;
    $(document).ready(function () {
        term.terminal(async (command) => {
            await currentInterpreter(command);
        }, {
            greetings: 'Welcome to the terminal emulator. Type \'help\' for commands.',
            prompt: shellPrompt,
        });
    });
    // Pyodide and terminal setup after initialization
    const { PyodideConsole } = pyodide.pyimport('pyodide.console');
    const pyconsole = PyodideConsole(pyodide.globals);
    pyconsole.stdout_callback = (s) => echo(s, { newline: false });
    pyconsole.stderr_callback = (s) => term.error(s.trimEnd());
    const namespace = pyodide.globals.get('dict')();
    const await_fut = pyodide.runPython(`import builtins
     from pyodide.ffi import to_js
     async def await_fut(fut):
         res = await fut
         if res is not None:
             builtins._ = res
         return to_js([res], depth=1)
     await_fut
    `, { globals: namespace });
    namespace.destroy();
}
async function initializeTerminal() {
    return new Promise((resolve) => {
        $(document).ready(() => resolve($('body').terminal())); // Ensures terminal is initialized
    });
}
window.console_ready = main(); // Start the main function when ready
