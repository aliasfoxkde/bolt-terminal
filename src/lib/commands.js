import { VirtualFileSystem } from './filesystem';
import { loadPyodide } from 'pyodide';
export class CommandHandler {
    fs;
    pyodide = null;
    terminal;
    constructor(terminal) {
        this.fs = new VirtualFileSystem();
        this.terminal = terminal;
    }
    async initPyodide() {
        if (!this.pyodide) {
            this.terminal.echo('Loading Pyodide...');
            this.pyodide = await loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
                stdout: (text) => this.terminal.echo(text),
                stderr: (text) => this.terminal.error(text)
            });
            this.terminal.echo('Pyodide loaded successfully!');
        }
        return this.pyodide;
    }
    async handleCommand(command) {
        const args = command.match(/(?:[^\s"]+|"[^"]*")+/g)?.map(arg => arg.startsWith('"') && arg.endsWith('"') ? arg.slice(1, -1) : arg) || [];
        if (args.length === 0)
            return;
        const cmd = args[0];
        const cmdArgs = args.slice(1);
        try {
            switch (cmd) {
                case 'ls':
                    this.ls(cmdArgs);
                    break;
                case 'cd':
                    this.cd(cmdArgs);
                    break;
                case 'pwd':
                    this.pwd();
                    break;
                case 'mkdir':
                    this.mkdir(cmdArgs);
                    break;
                case 'touch':
                    this.touch(cmdArgs);
                    break;
                case 'rm':
                    this.rm(cmdArgs);
                    break;
                case 'cp':
                    this.cp(cmdArgs);
                    break;
                case 'mv':
                    this.mv(cmdArgs);
                    break;
                case 'cat':
                    this.cat(cmdArgs);
                    break;
                case 'echo':
                    this.echo(cmdArgs);
                    break;
                case 'python':
                    await this.python(cmdArgs);
                    break;
                case 'help':
                    this.help();
                    break;
                default:
                    this.terminal.error(`Command not found: ${cmd}`);
            }
        }
        catch (error) {
            this.terminal.error(error.message);
        }
    }
    ls(args) {
        const options = args.filter(arg => arg.startsWith('-'));
        const paths = args.filter(arg => !arg.startsWith('-')) || ['.'];
        const showHidden = options.includes('-a');
        for (const path of paths) {
            try {
                const files = this.fs.ls(path, showHidden);
                this.terminal.echo(files.join('  '));
            }
            catch (error) {
                this.terminal.error(error.message);
            }
        }
    }
    cd(args) {
        if (args.length !== 1) {
            this.terminal.error('Usage: cd <directory>');
            return;
        }
        this.fs.cd(args[0]);
    }
    pwd() {
        this.terminal.echo(this.fs.pwd());
    }
    mkdir(args) {
        if (args.length === 0) {
            this.terminal.error('Usage: mkdir <directory>');
            return;
        }
        args.forEach(dir => this.fs.mkdir(dir));
    }
    touch(args) {
        if (args.length === 0) {
            this.terminal.error('Usage: touch <file>');
            return;
        }
        args.forEach(file => this.fs.touch(file));
    }
    rm(args) {
        const recursive = args.includes('-r') || args.includes('-rf');
        const files = args.filter(arg => !arg.startsWith('-'));
        if (files.length === 0) {
            this.terminal.error('Usage: rm [-r] <file>');
            return;
        }
        files.forEach(file => this.fs.rm(file, recursive));
    }
    cp(args) {
        if (args.length !== 2) {
            this.terminal.error('Usage: cp <source> <destination>');
            return;
        }
        this.fs.cp(args[0], args[1]);
    }
    mv(args) {
        if (args.length !== 2) {
            this.terminal.error('Usage: mv <source> <destination>');
            return;
        }
        this.fs.mv(args[0], args[1]);
    }
    cat(args) {
        if (args.length === 0) {
            this.terminal.error('Usage: cat <file>');
            return;
        }
        args.forEach(file => {
            try {
                const content = this.fs.readFile(file);
                this.terminal.echo(content);
            }
            catch (error) {
                this.terminal.error(error.message);
            }
        });
    }
    echo(args) {
        this.terminal.echo(args.join(' '));
    }
    async python(args) {
        const pyodide = await this.initPyodide();
        if (args.length > 0) {
            // Execute Python file or command
            const code = args.join(' ');
            try {
                const result = await pyodide.runPythonAsync(code);
                if (result !== undefined) {
                    this.terminal.echo(result);
                }
            }
            catch (error) {
                this.terminal.error(error.message);
            }
        }
        else {
            // Interactive Python REPL
            this.terminal.echo('Python 3.11.3 (Pyodide)');
            this.terminal.echo('Type "exit()" to return to shell');
            // Change prompt and set up REPL mode
            this.terminal.push(async (command) => {
                if (command.trim() === 'exit()') {
                    this.terminal.pop();
                    return;
                }
                try {
                    const result = await pyodide.runPythonAsync(command);
                    if (result !== undefined) {
                        this.terminal.echo(result);
                    }
                }
                catch (error) {
                    this.terminal.error(error.message);
                }
            }, {
                prompt: '>>> '
            });
        }
    }
    help() {
        this.terminal.echo('Available commands:\n' +
            '  ls [-a] [path]    List directory contents\n' +
            '  cd <path>        Change directory\n' +
            '  pwd             Print working directory\n' +
            '  mkdir <dir>     Create directory\n' +
            '  touch <file>    Create empty file\n' +
            '  rm [-r] <file>  Remove file or directory\n' +
            '  cp <src> <dst>  Copy file\n' +
            '  mv <src> <dst>  Move file\n' +
            '  cat <file>      Display file contents\n' +
            '  echo <text>     Display text\n' +
            '  python          Start Python REPL\n' +
            '  help            Show this help message');
    }
}
