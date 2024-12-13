import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { CommandHandler } from './lib/commands';
import './styles/app.css';
function App() {
    const terminalRef = useRef(null);
    const layoutRef = useRef(null);
    const sidebarRef = useRef(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    useEffect(() => {
        if (!terminalRef.current)
            return;
        let commandHandler;
        const term = $(terminalRef.current).terminal(async function (command) {
            if (command.trim() !== '') {
                await commandHandler.handleCommand(command);
            }
        }, {
            greetings: 'Bolt Terminal v0.1.1\nType "help" for available commands.',
            name: 'bolt_terminal',
            height: '100%',
            prompt: '$ ',
            completion: ['ls', 'cd', 'pwd', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'cat', 'echo', 'python', 'help']
        });
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
                const handleMouseMove = (e) => {
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
                const handleMouseMove = (e) => {
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
            if (!layout)
                return;
            if (!document.fullscreenElement) {
                layout.requestFullscreen();
                document.documentElement.style.setProperty('--terminal-height', '100vh');
            }
            else {
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
    return (_jsxs("div", { id: "layout", ref: layoutRef, children: [_jsxs("div", { id: "sidebar", ref: sidebarRef, className: isSidebarCollapsed ? 'collapsed' : '', children: [_jsx("div", { id: "sidebar-resize-handle" }), _jsx("button", { id: "sidebar-toggle", onClick: toggleSidebar, children: isSidebarCollapsed ? '→' : '←' })] }), _jsxs("div", { id: "main-content", children: [_jsx("div", { id: "editor-pane" }), _jsxs("div", { id: "terminal-bar", children: [_jsx("span", { children: "Terminal" }), _jsx("button", { id: "fullscreen-button", children: "\u2922" })] }), _jsx("div", { id: "terminal-container", children: _jsx("div", { ref: terminalRef }) })] })] }));
}
export default App;
