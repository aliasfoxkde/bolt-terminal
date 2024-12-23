import { VirtualFileSystem } from './filesystem';
import { loadPyodide } from 'pyodide';

export class CommandHandler {
    fs;
    pyodide = null;
    terminal;
    currentDir = '/';  // Default root directory

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
                case 'git':
                    this.git(cmdArgs);
                    break;
                case 'vi':
                    this.vi();
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
	
	// git command to interact with Git repositories using isomorphic-git
	async git(args) {
		const command = args[0];
		const repoUrl = args[1];
		const ref = args.ref || 'main';  // Default branch
		const fileList = args.slice(2);  // For 'add' command, it will be file paths
		
		try {
			switch (command) {
				case 'clone': {
					if (!repoUrl) {
						this.terminal.error('Error: A repository URL must be provided.');
						return;
					}
					const repoName = path.basename(repoUrl, '.git') || 'repository';
					const dir = path.resolve(process.cwd(), repoName);

					this.terminal.echo(`Cloning ${repoUrl} into ${dir}...`);
					await git.clone({ fs, http, dir, url: repoUrl });
					this.terminal.echo('Clone completed successfully.');
					break;
				}

				case 'pull': {
					const dir = process.cwd();
					this.terminal.echo(`Pulling changes into ${dir} on branch ${ref}...`);
					await git.pull({
						fs,
						http,
						dir,
						ref,
						singleBranch: true,
						fastForwardOnly: true,
					});
					this.terminal.echo('Pull completed successfully.');
					break;
				}

				case 'push': {
					const dir = process.cwd();
					this.terminal.echo(`Pushing changes from ${dir} on branch ${ref}...`);
					await git.push({ fs, http, dir, ref });
					this.terminal.echo('Push completed successfully.');
					break;
				}

				case 'status': {
					const dir = process.cwd();
					const isGitRepo = fs.existsSync(path.join(dir, '.git'));
					
					if (!isGitRepo) {
						this.terminal.error('Error: This is not a git repository (no .git directory found).');
						return;
					}
					
					const status = await git.status({ fs, dir, filepath: '.' });
					this.terminal.echo('Status:');
					this.terminal.echo(status);
					break;
				}

				case 'add': {
					const dir = process.cwd();
					if (fileList.length === 0) {
						this.terminal.error('Error: You must specify files to add.');
						return;
					}

					this.terminal.echo(`Adding files: ${fileList.join(', ')}...`);
					await git.add({ fs, dir, filepath: fileList });
					this.terminal.echo('Files added to staging area.');
					break;
				}

				case 'commit': {
					const dir = process.cwd();
					const message = args.message || args.m;
					if (!message) {
						this.terminal.error('Error: You must specify a commit message using --message or -m.');
						return;
					}

					this.terminal.echo(`Committing changes with message: "${message}"...`);
					await git.commit({ fs, dir, author: { name: 'User', email: 'user@example.com' }, message });
					this.terminal.echo('Commit successful.');
					break;
				}

				default:
					this.terminal.error('Unknown git command.');
					break;
			}
		} catch (error) {
			this.terminal.error(`Error: ${error.message}`);
		}
		this.updatePrompt();  // Update prompt after executing git command
	}


    // vi command to open Helix editor
    vi() {
        const helixCommand = 'helix';  // Assuming Helix editor is installed and accessible in the PATH
        exec(helixCommand, (error, stdout, stderr) => {
            if (error) {
                this.terminal.error(`Error opening Helix editor: ${stderr}`);
                return;
            }
            this.terminal.echo(stdout);
        });
        this.updatePrompt();  // Update prompt after executing vi command
    }

    // ls command with support for -a (show hidden files)
    ls(args) {
        const options = args.filter(arg => arg.startsWith('-'));
        const paths = args.filter(arg => !arg.startsWith('-')) || ['.'];
        const showHidden = options.includes('-a');
        
        paths.forEach(path => {
            try {
                const files = this.fs.ls(path, showHidden);
                this.terminal.echo(files.join('  '));
            } catch (error) {
                this.terminal.error(`Error listing directory: ${error.message}`);
            }
        });

        this.updatePrompt();  // Update prompt after executing ls
    }

    // cd command to change directory
    cd(args) {
        if (args.length !== 1) {
            this.terminal.error('Usage: cd <directory>');
            return;
        }
        try {
            this.fs.cd(args[0]);
            this.currentDir = this.fs.pwd();  // Update current directory
            this.updatePrompt();
            this.ls([this.currentDir]);  // List contents of the current directory
        } catch (error) {
            this.terminal.error(`Error changing directory: ${error.message}`);
        }
    }

    // pwd command to print the current working directory
    pwd() {
        this.terminal.echo(this.fs.pwd());
        this.updatePrompt();  // Update prompt after executing pwd
    }

    // mkdir command to create directories
    mkdir(args) {
        if (args.length === 0) {
            this.terminal.error('Usage: mkdir <directory>');
            return;
        }
        args.forEach(dir => {
            try {
                this.fs.mkdir(dir);
                this.terminal.echo(`Directory created: ${dir}`);
                this.ls([this.fs.pwd()]);  // Refresh directory listing
            } catch (error) {
                this.terminal.error(`Error creating directory ${dir}: ${error.message}`);
            }
        });
        this.updatePrompt();  // Update prompt after executing mkdir
    }

    // touch command to create files
    touch(args) {
        if (args.length === 0) {
            this.terminal.error('Usage: touch <file>');
            return;
        }
        args.forEach(file => {
            try {
                this.fs.touch(file);
                this.terminal.echo(`File created: ${file}`);
                this.ls([this.fs.pwd()]);  // Refresh directory listing
            } catch (error) {
                this.terminal.error(`Error creating file ${file}: ${error.message}`);
            }
        });
        this.updatePrompt();  // Update prompt after executing touch
    }

    // rm command to remove files or directories with optional -r and -f flags
    rm(args) {
        const recursive = args.includes('-r') || args.includes('-rf');
        const force = args.includes('-f') || args.includes('-rf');
        const files = args.filter(arg => !arg.startsWith('-'));

        if (files.length === 0) {
            this.terminal.error('Usage: rm [-r] [-f] <file>');
            return;
        }

        files.forEach(file => {
            try {
                this.fs.rm(file, recursive, force);
                this.terminal.echo(`Removed: ${file}`);
                this.ls([this.fs.pwd()]);  // Refresh directory listing
            } catch (error) {
                this.terminal.error(`Error removing file: ${file}. ${error.message}`);
            }
        });
        this.updatePrompt();  // Update prompt after executing rm
    }

    // cp command to copy files
    cp(args) {
        if (args.length !== 2) {
            this.terminal.error('Usage: cp <source> <destination>');
            return;
        }
        const [source, dest] = args;
        try {
            this.fs.cp(source, dest);
            this.terminal.echo(`Copied: ${source} to ${dest}`);
            this.ls([this.fs.pwd()]);  // Refresh directory listing
        } catch (error) {
            this.terminal.error(`Error copying file: ${error.message}`);
        }
        this.updatePrompt();  // Update prompt after executing cp
    }

    // mv command to move files
    mv(args) {
        if (args.length !== 2) {
            this.terminal.error('Usage: mv <source> <destination>');
            return;
        }
        const [source, dest] = args;
        try {
            this.fs.mv(source, dest);
            this.terminal.echo(`Moved: ${source} to ${dest}`);
            this.ls([this.fs.pwd()]);  // Refresh directory listing
        } catch (error) {
            this.terminal.error(`Error moving file: ${error.message}`);
        }
        this.updatePrompt();  // Update prompt after executing mv
    }

    // cat command to read the contents of a file
    cat(args) {
        if (args.length === 0) {
            this.terminal.error('Usage: cat <file>');
            return;
        }
        args.forEach(file => {
            try {
                const content = this.fs.readFile(file);
                this.terminal.echo(content);
            } catch (error) {
                this.terminal.error(`Error reading file ${file}: ${error.message}`);
            }
        });
        this.updatePrompt();  // Update prompt after executing cat
    }

    // echo command to display text
    echo(args) {
        this.terminal.echo(args.join(' '));
        this.updatePrompt();  // Update prompt after executing echo
    }

    // python command to run Python code
    async python(args) {
        const pyodide = await this.initPyodide();
        if (args.length > 0) {
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
        } else {
            this.terminal.echo('Python 3.11.3 (Pyodide)');
            this.terminal.echo('Type "exit()" to return to shell');
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

    // help command to list all available commands
    help() {
        this.terminal.echo('Available commands:\n' +
            '  ls [-a] [path]    List directory contents\n' +
            '  cd <path>        Change directory\n' +
            '  pwd             Print working directory\n' +
            '  mkdir <dir>     Create directory\n' +
            '  touch <file>    Create empty file\n' +
            '  rm [-r] [-f] <file>  Remove file or directory\n' +
            '  cp <src> <dst>  Copy file\n' +
            '  mv <src> <dst>  Move file\n' +
            '  cat <file>      Display file contents\n' +
            '  echo <text>     Display text\n' +
            '  python          Start Python REPL\n' +
            '  help            Show this help message');
        this.updatePrompt();  // Update prompt after executing help
    }

    // Update the terminal prompt dynamically to reflect the current directory
    updatePrompt() {
        this.terminal.echo(`\n${this.currentDir} ❯ `);
    }
}