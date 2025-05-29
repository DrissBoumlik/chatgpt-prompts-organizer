function injectStyles() {
    fetch(chrome.runtime.getURL('styles.css'))
        .then(res => res.text())
        .then(css => {
            // You can then inject it like:
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
        });
}

function syncFolders(folders) {
    chrome.storage.local.set({ folders }, () => {
        renderFolders();
    });
}



function showFolderPicker(folders, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'db-folder-list-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'db-folder-list-modal';

    const title = document.createElement('h2');
    title.className = 'db-folder-list-modal-header';
    title.textContent = 'Choose Folder';
    modal.appendChild(title);

    folders.forEach(folder => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.setAttribute('data-folder-name', folder.folderName);
        checkbox.id = `folder-${folder.folderName}`;
        const text = document.createElement('span');
        text.textContent = folder.folderName;
        const label = document.createElement('label');
        label.className = 'db-folder-list-modal-btn';
        label.setAttribute('for', `folder-${folder.folderName}`);
        label.addEventListener('mouseover', () => {
            label.style.backgroundColor = folder.color || '#262626';
        });
        label.addEventListener('mouseout', () => {
            label.style.backgroundColor = '';
        });
        label.appendChild(text);
        label.appendChild(checkbox);
        modal.appendChild(label);
    });
    
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
        overlay.remove();
    });
    
    const addButton = document.createElement('button');
    addButton.textContent = 'Submit';
    addButton.addEventListener('click', (e) => {
         document.querySelectorAll('.db-folder-list-modal input[type="checkbox"]:checked').forEach((checkbox) => {
            const folderName = checkbox.getAttribute('data-folder-name');
            // Add prompt to selected folder
            callback(folderName);
            // Close modal
            overlay.remove();
        });
    });
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'db-folder-list-modal-buttons';
    buttonsContainer.appendChild(closeButton);
    buttonsContainer.appendChild(addButton);
    modal.appendChild(buttonsContainer);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}

function observeSidebarPrompts(sidebar) {
    const observer = new MutationObserver(() => {
        const promptItems = sidebar.querySelectorAll('a');

        promptItems.forEach((item) => {
            if (item.querySelector('.db-folder-icon')) return;

            const folderBtn = document.createElement('button');
            folderBtn.innerHTML = '➕';
            folderBtn.className = 'db-folder-icon';

            folderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                chrome.storage.local.get(['folders'], (data) => {
                    let folders = data.folders || [];
                    const prompt = {
                        name: item.textContent.replace('➕', '').trim(),
                        link: item.getAttribute('href'),
                    };
                    showFolderPicker(folders, (folderName) => {
                        folders = addPromptToFolder(folderName, prompt, folders);
                        syncFolders(folders);
                    });
                });
            });

            item.appendChild(folderBtn);
        });
    });

    observer.observe(sidebar, { childList: true, subtree: true });
}


function renderFolders() {

    const container = document.getElementById('db-folders');
    chrome.storage.local.get(['folders'], (result) => {
        const folders = result.folders || [];

        container.innerHTML = ''; // Clear existing

        folders.forEach(folder => {
            const folderDiv = document.createElement('div');
            folderDiv.className = 'db-folder-item-container';
            
            // Folder header with toggle
            const folderItem = document.createElement('div');
            folderItem.className = 'db-folder-list-item';
            folderItem.style.backgroundColor = folder.color || '#262626';

            const title = document.createElement('span');
            title.className = "pointer w-100"
            title.textContent = folder.folderName;
            const editFolderNameBtn = document.createElement('span');
            editFolderNameBtn.className = "pointer"
            editFolderNameBtn.textContent = '✏️';
            editFolderNameBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const folderName = e.target.parentNode.parentNode.querySelector('span')?.textContent.trim();
                if (! folderName) {
                    return;
                }
                chrome.storage.local.get(['folders'], (result) => {
                    let folders = result.folders || [];
                    const folder = folders.find(f => f.folderName === folderName);
                    showFolderModal(folder.folderName, folder.color, folderName);
                });
            });
            const trashIcon = document.createElement('span');
            trashIcon.className = "pointer"
            trashIcon.textContent = '🗑️';
            trashIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                if (! confirm(`Are you sure you want to delete the folder "${folder.folderName}"? This action cannot be undone.`)) {
                    return;
                }
                
                chrome.storage.local.get(['folders'], (result) => {
                    let folders = result.folders || [];
                    folders = folders.filter(f => f.folderName !== folder.folderName);
                    syncFolders(folders);
                });
            });
            
            const folderActions = document.createElement('div');
            folderActions.className = 'db-folder-actions';
            folderActions.appendChild(editFolderNameBtn);
            folderActions.appendChild(trashIcon);

            folderItem.appendChild(title);
            folderItem.appendChild(folderActions);

            // Prompts container (hidden initially)
            const promptList = document.createElement('div');
            promptList.className = `db-prompt-item ${folder.hidden ? 'hidden' : 'visible'}`;

            folder.prompts.forEach(prompt => {
                const link = document.createElement('a');
                link.href = prompt.link;
                link.textContent = prompt.name;
                link.className = 'db-prompt-item-link';
                const trashIcon = document.createElement('span');
                trashIcon.className = 'pointer';
                trashIcon.textContent = '🗑️';
                trashIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    if (! confirm(`Are you sure you want to delete the prompt "${prompt.name}"? This action cannot be undone.`)) {
                        return;
                    }
                    // Remove prompt from folder
                    chrome.storage.local.get(['folders'], (result) => {
                        let folders = result.folders || [];
                        folders.map((f) => {
                            if (f.folderName === folder.folderName) {
                                f.prompts = f.prompts.filter(p => p.link !== prompt.link);
                                syncFolders(folders);
                            }
                        });
                        
                    });   
                });
                
                const promptWrapper = document.createElement('div');
                promptWrapper.className = 'db-prompt-item-wrapper';
                promptWrapper.appendChild(link);
                promptWrapper.appendChild(trashIcon);
                
                
                promptList.appendChild(promptWrapper);
            });

            title.addEventListener('click', () => {
                folder.hidden = ! folder.hidden;
                if (folder.hidden) {
                    promptList.classList.add('hidden');
                } else {
                    promptList.classList.remove('hidden');
                }
                syncFolders(folders);
            });

            folderDiv.appendChild(folderItem);
            folderDiv.appendChild(promptList);
            container.appendChild(folderDiv);
        });
    });
}


function addFolderIfNotExists(folderName, color, oldValue = null) {
    chrome.storage.local.get(['folders'], (result) => {
        let folders = result.folders || [];
        if (oldValue) {
            folders = folders.map(f => {
                if (f.folderName === oldValue) {
                    f.folderName = folderName;
                    f.color = color;
                }
                return f;
            });
            syncFolders(folders);
            return;
        }

        if (! folders.find(f => f.folderName === folderName)) {
            folders.push({ folderName, color, hidden: true, prompts: [] });
            syncFolders(folders);
        }
    });
}

function addPromptToFolder(folderName, prompt, folders) {
    const folder = folders.find(f => f.folderName === folderName);
    const exists = folder.prompts.some(p => p.link === prompt.link);
    if (! exists) {
        folder.prompts.push({ name: prompt.name, link: prompt.link });
    }
    return folders;
}

function showFolderModal(folderName = '', color = '#262626') {
    // Create modal elements
    const overlay = document.createElement('div');
    overlay.id = 'db-prompt-modal-overlay';

    const modal = document.createElement('div');
    modal.id = 'db-prompt-modal';
    
    const createFolderBtn = document.createElement('button');
    createFolderBtn.textContent = 'Create';
    createFolderBtn.addEventListener('click', () => {
        const oldValue = document.getElementById('prompt-folder-input').getAttribute('data-old-value');
        const name = document.getElementById('prompt-folder-input').value.trim();
        const color = document.getElementById('prompt-folder-color').value.trim();
        if (name) {
            addFolderIfNotExists(name, color, oldValue)
            document.body.removeChild(overlay);
        }
    });
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
        overlay.remove();
    });
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'db-folder-list-modal-buttons';
    buttonsContainer.appendChild(closeButton);
    buttonsContainer.appendChild(createFolderBtn);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Folder name';
    input.id = 'prompt-folder-input';
    input.value = folderName;
    input.setAttribute('data-old-value', folderName);
    input.autofocus = true;
    
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.id = 'prompt-folder-color';
    colorInput.value = color;
    modal.appendChild(input);
    modal.appendChild(colorInput);
    modal.appendChild(buttonsContainer);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    input.focus();

    

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}


function waitForSidebarAndInjectButton() {
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('history');

        if (!sidebar || document.getElementById('db-prompt-folder-btn')) {
            return;
        }
        

        clearInterval(checkInterval);
        
        injectStyles();

        injectAddToFolderButton();

        const button = document.createElement('button');
        button.id = 'db-prompt-folder-btn';
        button.textContent = 'New Folder ➕';

        button.addEventListener('click', () => {
            // Show prompt to enter folder name
            showFolderModal();
        });

        const foldersWrapper = document.createElement('div');
        foldersWrapper.id = 'db-folder-wrapper';

        // 🆕 Show folders with prompts below
        const foldersWithPromptsContainer = document.createElement('div');
        foldersWithPromptsContainer.id = 'db-folders';
        foldersWrapper.append(button, foldersWithPromptsContainer);
        sidebar.parentNode.insertBefore(foldersWrapper, sidebar);

        // Render them
        renderFolders();
        
        // ✅ Watch for prompt items being added to the sidebar
        observeSidebarPrompts(sidebar);

    }, 500);
}

function injectAddToFolderButton() {
    
    const checkInterval = setInterval(() => {
        const pageHeader = document.getElementById('page-header');

        if (! pageHeader || document.getElementById('db-add-to-folder-btn')) {
            return;
        }

        clearInterval(checkInterval);
        const url = window.location.href;
        const pattern = /^https:\/\/chatgpt\.com\/c\/[a-zA-Z0-9-]+$/;

        if (pattern.test(url)) {
            const button = document.createElement('button');
            button.id = 'db-add-to-folder-btn';
            button.textContent = '➕'
            button.title = 'Add to Folder';
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                chrome.storage.local.get(['folders'], (data) => {
                    let folders = data.folders || [];
                    const prompt = {
                        name: document.title.trim(),
                        link: url.replace('https://chatgpt.com/c/', '/c/'),
                    };
                    showFolderPicker(folders, (folderName) => {
                        folders = addPromptToFolder(folderName, prompt, folders);
                        syncFolders(folders);
                    });
                });
            });

            document.body.append(button);
            // sidebar.parentNode.insertBefore(foldersWrapper, sidebar);
        }
    });
    
}

// Run on initial load
waitForSidebarAndInjectButton();
