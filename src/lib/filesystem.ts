export class VirtualFileSystem {
  private fs: { [key: string]: any } = {};
  private currentPath: string = '/';

  constructor() {
    this.fs = { '/': {} };
  }

  resolvePath(path: string): string {
    if (path.startsWith('/')) return path;
    
    const current = this.currentPath.split('/').filter(Boolean);
    const parts = path.split('/').filter(Boolean);
    
    for (const part of parts) {
      if (part === '..') {
        current.pop();
      } else if (part !== '.') {
        current.push(part);
      }
    }
    
    return '/' + current.join('/');
  }

  private getNode(path: string): any {
    const parts = path.split('/').filter(Boolean);
    let current = this.fs['/'];
    
    for (const part of parts) {
      if (!current[part]) throw new Error(`No such file or directory: ${path}`);
      current = current[part];
    }
    
    return current;
  }

  mkdir(path: string): void {
    const fullPath = this.resolvePath(path);
    const parts = fullPath.split('/').filter(Boolean);
    let current = this.fs['/'];
    
    for (const part of parts) {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
  }

  cd(path: string): void {
    const newPath = this.resolvePath(path);
    const node = this.getNode(newPath);
    
    if (typeof node !== 'object') {
      throw new Error(`Not a directory: ${path}`);
    }
    
    this.currentPath = newPath;
  }

  ls(path: string = '.', showHidden: boolean = false): string[] {
    const targetPath = this.resolvePath(path);
    const node = this.getNode(targetPath);
    
    if (typeof node !== 'object') {
      throw new Error(`Not a directory: ${path}`);
    }
    
    return Object.keys(node).filter(name => showHidden || !name.startsWith('.'));
  }

  pwd(): string {
    return this.currentPath;
  }

  touch(path: string): void {
    const fullPath = this.resolvePath(path);
    const parts = fullPath.split('/').filter(Boolean);
    const fileName = parts.pop();
    let current = this.fs['/'];
    
    for (const part of parts) {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    if (fileName) {
      current[fileName] = '';
    }
  }

  writeFile(path: string, content: string): void {
    const fullPath = this.resolvePath(path);
    const parts = fullPath.split('/').filter(Boolean);
    const fileName = parts.pop();
    let current = this.fs['/'];
    
    for (const part of parts) {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    if (fileName) {
      current[fileName] = content;
    }
  }

  readFile(path: string): string {
    const fullPath = this.resolvePath(path);
    const node = this.getNode(fullPath);
    
    if (typeof node !== 'string') {
      throw new Error(`Not a file: ${path}`);
    }
    
    return node;
  }

  rm(path: string, recursive: boolean = false): void {
    const fullPath = this.resolvePath(path);
    const parts = fullPath.split('/').filter(Boolean);
    const fileName = parts.pop();
    let current = this.fs['/'];
    
    for (const part of parts) {
      if (!current[part]) throw new Error(`No such file or directory: ${path}`);
      current = current[part];
    }
    
    if (fileName) {
      if (!recursive && typeof current[fileName] === 'object') {
        throw new Error(`Cannot remove directory: ${path}`);
      }
      delete current[fileName];
    }
  }

  cp(source: string, dest: string): void {
    const sourcePath = this.resolvePath(source);
    const destPath = this.resolvePath(dest);
    
    const sourceNode = this.getNode(sourcePath);
    this.writeFile(destPath, sourceNode);
  }

  mv(source: string, dest: string): void {
    this.cp(source, dest);
    this.rm(source, true);
  }
}
