// src/commands/python.ts
import { loadPyodide } from 'pyodide';

let pyodide: any = null;

export const pythonCommands = {
  python: async (code: string) => {
    try {
      if (!pyodide) {
        pyodide = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.0/full/"
        });
      }
      const result = await pyodide.runPython(code);
      return result?.toString() || '';
    } catch (error) {
      return `Python error: ${error.message}`;
    }
  }
} as const;

export default pythonCommands;
