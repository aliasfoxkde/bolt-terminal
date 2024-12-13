export class VirtualFileSystem {
    fs = {};
    currentPath = '/';
    constructor() {
        this.fs = { '/': {} };
    }
    resolvePath(path) {
        if (path.startsWith('/'))
            return path;
        const current = this.currentPath.split('/').filter(Boolean);
        const parts = path.split('/').filter(Boolean);
        for (const part of parts) {
            if (part === '..') {
                current.pop();
            }
            else if (part !== '.') {
                current.push(part);
            }
        }
        return '/' + current.join('/');
    }
    getNode(path) {
        const parts = path.split('/').filter(Boolean);
        let current = this.fs['/'];
        for (const part of parts) {
            if (!current[part])
                throw new Error(`No such file or directory: ${path}`);
            current = current[part];
        }
        return current;
    }
    mkdir(path) {
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
    cd(path) {
        const newPath = this.resolvePath(path);
        const node = this.getNode(newPath);
        if (typeof node !== 'object') {
            throw new Error(`Not a directory: ${path}`);
        }
        this.currentPath = newPath;
    }
    ls(path = '.', showHidden = false) {
        const targetPath = this.resolvePath(path);
        const node = this.getNode(targetPath);
        if (typeof node !== 'object') {
            throw new Error(`Not a directory: ${path}`);
        }
        return Object.keys(node).filter(name => showHidden || !name.startsWith('.'));
    }
    pwd() {
        return this.currentPath;
    }
    touch(path) {
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
    writeFile(path, content) {
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
    readFile(path) {
        const fullPath = this.resolvePath(path);
        const node = this.getNode(fullPath);
        if (typeof node !== 'string') {
            throw new Error(`Not a file: ${path}`);
        }
        return node;
    }
    rm(path, recursive = false) {
        const fullPath = this.resolvePath(path);
        const parts = fullPath.split('/').filter(Boolean);
        const fileName = parts.pop();
        let current = this.fs['/'];
        for (const part of parts) {
            if (!current[part])
                throw new Error(`No such file or directory: ${path}`);
            current = current[part];
        }
        if (fileName) {
            if (!recursive && typeof current[fileName] === 'object') {
                throw new Error(`Cannot remove directory: ${path}`);
            }
            delete current[fileName];
        }
    }
    cp(source, dest) {
        const sourcePath = this.resolvePath(source);
        const destPath = this.resolvePath(dest);
        const sourceNode = this.getNode(sourcePath);
        this.writeFile(destPath, sourceNode);
    }
    mv(source, dest) {
        this.cp(source, dest);
        this.rm(source, true);
    }
}
