import { VirtualFileSystem } from './filesystem';
import { loadPyodide } from 'pyodide';

export class CommandHandler {
  private fs: VirtualFileSystem;
  private pyodide: any = null;
  private terminal: any;

  constructor(terminal: any) {
    this.fs = new VirtualFileSystem();
    this.terminal = terminal;
  }

  async initPyodide() {
    if (!this.pyodide) {
      this.terminal.echo('Loading Pyodide...');
      this.pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
        stdout: (text: string) => this.terminal.echo(text),
        stderr: (text: string) => this.terminal.error(text)
      });
      this.terminal.echo('Pyodide loaded successfully!');
    }
    return this.pyodide;
  }

  async handleCommand(command: string): Promise<void> {
    const args = command.match(/(?:[^\s"]+|"[^"]*")+/g)?.map(arg => 
      arg.startsWith('"') && arg.endsWith('"') ? arg.slice(1, -1) : arg
    ) || [];
    
    if (args.length === 0) return;

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
    } catch (error: any) {
      this.terminal.error(error.message);
    }
  }

  private ls(args: string[]): void {
    const options = args.filter(arg => arg.startsWith('-'));
    const paths = args.filter(arg => !arg.startsWith('-')) || ['.'];
    const showHidden = options.includes('-a');
    
    for (const path of paths) {
      try {
        const files = this.fs.ls(path, showHidden);
        this.terminal.echo(files.join('  '));
      } catch (error: any) {
        this.terminal.error(error.message);
      }
    }
  }

  private cd(args: string[]): void {
    if (args.length !== 1) {
      this.terminal.error('Usage: cd <directory>');
      return;
    }
    this.fs.cd(args[0]);
  }

  private pwd(): void {
    this.terminal.echo(this.fs.pwd());
  }

  private mkdir(args: string[]): void {
    if (args.length === 0) {
      this.terminal.error('Usage: mkdir <directory>');
      return;
    }
    args.forEach(dir => this.fs.mkdir(dir));
  }

  private touch(args: string[]): void {
    if (args.length === 0) {
      this.terminal.error('Usage: touch <file>');
      return;
    }
    args.forEach(file => this.fs.touch(file));
  }

  private rm(args: string[]): void {
    const recursive = args.includes('-r') || args.includes('-rf');
    const files = args.filter(arg => !arg.startsWith('-'));
    
    if (files.length === 0) {
      this.terminal.error('Usage: rm [-r] <file>');
      return;
    }
    
    files.forEach(file => this.fs.rm(file, recursive));
  }

  private cp(args: string[]): void {
    if (args.length !== 2) {
      this.terminal.error('Usage: cp <source> <destination>');
      return;
    }
    this.fs.cp(args[0], args[1]);
  }

  private mv(args: string[]): void {
    if (args.length !== 2) {
      this.terminal.error('Usage: mv <source> <destination>');
      return;
    }
    this.fs.mv(args[0], args[1]);
  }

  private cat(args: string[]): void {
    if (args.length === 0) {
      this.terminal.error('Usage: cat <file>');
      return;
    }
    args.forEach(file => {
      try {
        const content = this.fs.readFile(file);
        this.terminal.echo(content);
      } catch (error: any) {
        this.terminal.error(error.message);
      }
    });
  }

  private echo(args: string[]): void {
    this.terminal.echo(args.join(' '));
  }

  private async python(args: string[]): Promise<void> {
    const pyodide = await this.initPyodide();
    
    if (args.length > 0) {
      // Execute Python file or command
      const code = args.join(' ');
      try {
        const result = await pyodide.runPythonAsync(code);
        if (result !== undefined) {
          this.terminal.echo(result);
        }
      } catch (error: any) {
        this.terminal.error(error.message);
      }
    } else {
      // Interactive Python REPL
      this.terminal.echo('Python 3.11.3 (Pyodide)');
      this.terminal.echo('Type "exit()" to return to shell');
      
      // Change prompt and set up REPL mode
      this.terminal.push(async (command: string) => {
        if (command.trim() === 'exit()') {
          this.terminal.pop();
          return;
        }
        
        try {
          const result = await pyodide.runPythonAsync(command);
          if (result !== undefined) {
            this.terminal.echo(result);
          }
        } catch (error: any) {
          this.terminal.error(error.message);
        }
      }, {
        prompt: '>>> '
      });
    }
  }

  private help(): void {
    this.terminal.echo(
      'Available commands:\n' +
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
      '  help            Show this help message'
    );
  }
}
