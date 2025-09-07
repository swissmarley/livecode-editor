let currentTab = 'html';
        let autoRun = true;
        let debounceTimer;

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            runCode();
            setupAutoRun();
            setupResizer();
            setupTabIndentation();
        });

        window.switchTab = function(event, tab) {
            currentTab = tab;
            
            // Update tabs
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.editor').forEach(e => e.classList.remove('active'));
            
            // Set active tab and editor
            event.target.closest('.tab').classList.add('active');
            document.getElementById(tab + 'Editor').classList.add('active');
        }

        window.runCode = function() {
            const html = document.getElementById('htmlCode').value;
            const css = document.getElementById('cssCode').value;
            const js = document.getElementById('jsCode').value;
            
            const preview = document.getElementById('preview');
            const previewDoc = preview.contentDocument || preview.contentWindow.document;
            
            // Construct the full HTML
            const fullHTML = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>${css}</style>
        </head>
        <body>
        ${html.replace(/<\/?html[^>]*>/gi, '').replace(/<\/?head[^>]*>/gi, '').replace(/<\/?body[^>]*>/gi, '').replace(/<meta[^>]*>/gi, '').replace(/<title[^>]*>.*?<\/title>/gi, '')}
        <script>
        ${js}
        <\/script>
        </body>
        </html>`;
            
            previewDoc.open();
            previewDoc.write(fullHTML);
            previewDoc.close();
        }

        function setupAutoRun() {
            const editors = ['htmlCode', 'cssCode', 'jsCode'];
            
            editors.forEach(id => {
                document.getElementById(id).addEventListener('input', () => {
                    if (autoRun) {
                        clearTimeout(debounceTimer);
                        debounceTimer = setTimeout(() => {
                            runCode();
                        }, 500);
                    }
                });
            });
        }

        window.clearAll = function() {
            if (confirm('Are you sure you want to clear all code?')) {
                document.getElementById('htmlCode').value = '';
                document.getElementById('cssCode').value = '';
                document.getElementById('jsCode').value = '';
                runCode();
            }
        }

        window.refreshPreview = function() {
            runCode();
        }

window.downloadCode = function() {
    const html = document.getElementById('htmlCode').value;
    const css = document.getElementById('cssCode').value;
    const js = document.getElementById('jsCode').value;
    
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Code</title>
    <style>
${css}
    </style>
</head>
<body>
${html.replace(/<\/?html[^>]*>/gi, '').replace(/<\/?head[^>]*>/gi, '').replace(/<\/?body[^>]*>/gi, '')}
<script>
${js}
<\/script>
</body>
</html>`;
    
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code.html';
    a.click();
    URL.revokeObjectURL(url);
}

        window.setLayout = function(event, layout) {
            const container = document.getElementById('container');
            const buttons = document.querySelectorAll('.layout-btn');
            
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            if (layout === 'vertical') {
                container.style.flexDirection = 'column';
                document.getElementById('previewContainer').style.borderLeft = 'none';
                document.getElementById('previewContainer').style.borderTop = '1px solid #2c303a';
            } else {
                container.style.flexDirection = 'row';
                document.getElementById('previewContainer').style.borderTop = 'none';
                document.getElementById('previewContainer').style.borderLeft = '1px solid #2c303a';
            }
        }

        function setupResizer() {
            const resizer = document.getElementById('resizer');
            const editorsContainer = document.getElementById('editorsContainer');
            const previewContainer = document.getElementById('previewContainer');
            let isResizing = false;
            
            resizer.addEventListener('mousedown', (e) => {
                isResizing = true;
                resizer.classList.add('resizing');
                document.body.style.cursor = 'ew-resize';
                document.body.style.userSelect = 'none';
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;
                
                const containerWidth = document.getElementById('container').offsetWidth;
                const newWidth = e.clientX;
                const percentage = (newWidth / containerWidth) * 100;
                
                if (percentage > 20 && percentage < 80) {
                    editorsContainer.style.flex = `0 0 ${percentage}%`;
                    previewContainer.style.flex = `0 0 ${100 - percentage}%`;
                }
            });
            
            document.addEventListener('mouseup', () => {
                isResizing = false;
                resizer.classList.remove('resizing');
                document.body.style.cursor = 'default';
                document.body.style.userSelect = 'auto';
            });
        }

        function setupTabIndentation() {
            const textareas = document.querySelectorAll('textarea');
            
            textareas.forEach(textarea => {
                textarea.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab') {
                        e.preventDefault();
                        
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const value = textarea.value;
                        
                        if (e.shiftKey) {
                            // Handle shift+tab (outdent)
                            const beforeStart = value.substring(0, start);
                            const afterEnd = value.substring(end);
                            const selected = value.substring(start, end);
                            
                            if (selected.length > 0) {
                                // Multiple lines selected
                                const lines = selected.split('\n');
                                const outdented = lines.map(line => 
                                    line.startsWith('  ') ? line.substring(2) : line
                                ).join('\n');
                                
                                textarea.value = beforeStart + outdented + afterEnd;
                                textarea.selectionStart = start;
                                textarea.selectionEnd = start + outdented.length;
                            } else {
                                // Single line
                                const lineStart = beforeStart.lastIndexOf('\n') + 1;
                                const lineContent = beforeStart.substring(lineStart);
                                
                                if (lineContent.startsWith('  ')) {
                                    textarea.value = beforeStart.substring(0, lineStart) + 
                                                   lineContent.substring(2) + 
                                                   afterEnd;
                                    textarea.selectionStart = textarea.selectionEnd = start - 2;
                                }
                            }
                        } else {
                            // Handle tab (indent)
                            textarea.value = value.substring(0, start) + '  ' + value.substring(end);
                            textarea.selectionStart = textarea.selectionEnd = start + 2;
                        }
                        
                        // Trigger input event for auto-run
                        textarea.dispatchEvent(new Event('input'));
                    }
                });
            });
        }
