import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'jquery.terminal';
import { CommandHandler } from './lib/commands';
import './styles/app.css';

declare global {
  interface Window {
    term: Terminal;
  }
}

function App() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) return;

    let commandHandler: CommandHandler;

    const term = $(terminalRef.current).terminal(
      async function(command: string) {
        if (command.trim() !== '') {
          await commandHandler.handleCommand(command);
        }
      }, {
        greetings: 'Bolt Terminal v0.1.1\nType "help" for available commands.',
        name: 'bolt_terminal',
        height: '100%',
        prompt: '$ ',
        completion: ['ls', 'cd', 'pwd', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'cat', 'echo', 'python', 'help']
      }
    );

    commandHandler = new CommandHandler(term);
    window.term = term;

    // Terminal resize handling
    let startY = 0;
    let startHeight = 0;
    const terminalBar = document.getElementById('terminal-bar');
    
    if (terminalBar) {
      terminalBar.addEventListener('mousedown', (e) => {
        startY = e.clientY;
        startHeight = terminalRef.current?.offsetHeight || 0;
        
        const handleMouseMove = (e: MouseEvent) => {
          const delta = startY - e.clientY;
          const newHeight = startHeight + delta;
          if (newHeight > 100) {
            document.documentElement.style.setProperty('--terminal-height', `${newHeight}px`);
            term.resize();
          }
        };

        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      });
    }

    // Sidebar resize handling
    let startX = 0;
    let startWidth = 0;
    const sidebarHandle = document.getElementById('sidebar-resize-handle');
    
    if (sidebarHandle) {
      sidebarHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startX = e.clientX;
        startWidth = sidebarRef.current?.offsetWidth || 0;
        
        const handleMouseMove = (e: MouseEvent) => {
          const delta = e.clientX - startX;
          const newWidth = startWidth + delta;
          if (newWidth >= 50 && newWidth <= 800) {
            document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
          }
        };

        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      });
    }

    // Fullscreen handling
    const toggleFullscreen = () => {
      const layout = layoutRef.current;
      if (!layout) return;

      if (!document.fullscreenElement) {
        layout.requestFullscreen();
        document.documentElement.style.setProperty('--terminal-height', '100vh');
      } else {
        document.exitFullscreen();
        document.documentElement.style.setProperty('--terminal-height', '250px');
      }
      term.resize();
    };

    const fullscreenBtn = document.getElementById('fullscreen-button');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', toggleFullscreen);
    }

    return () => {
      fullscreenBtn?.removeEventListener('click', toggleFullscreen);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div id="layout" ref={layoutRef}>
      <div id="sidebar" ref={sidebarRef} className={isSidebarCollapsed ? 'collapsed' : ''}>
        <div id="sidebar-resize-handle"></div>
        <button id="sidebar-toggle" onClick={toggleSidebar}>
          {isSidebarCollapsed ? '→' : '←'}
        </button>
        {/* Sidebar content */}
      </div>
      <div id="main-content">
        <div id="editor-pane">
          {/* Editor content */}
        </div>
        <div id="terminal-bar">
          <span>Terminal</span>
          <button id="fullscreen-button">⤢</button>
        </div>
        <div id="terminal-container">
          <div ref={terminalRef}></div>
        </div>
      </div>
    </div>
  );
}

export default App;
