function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
    .hidden {
        display: none !important;
    }
    .pointer {
        cursor: pointer !important;
    }
    #db-folder-wrapper {
        width: calc(100% - 15px);
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin: 10px auto 0;
    }
    #db-folders {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }
    #db-prompt-folder-btn {
        width: 100%;
        padding: 5px 10px;
        //   background: #6d6d6d;
        color: white;
        font-size: 14px;
        border: 1px solid #6d6d6d;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        
        &:hover {
            background: #454545;
        }
    }
    .db-folder-item-container {
        border: 1px solid #565656;
        border-radius: 5px;
    }
    .db-folder-list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
    //   margin: 5px 10px;
        padding: 4px 8px;
        background: #262626;
        border-radius: 5px;
        font-size: 14px;
    }
    .db-folder-list-item span:first-child, .db-prompt-item-link {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
        
    .db-folder-actions {
        display: flex;
        gap: 5px;
    }

    #db-prompt-modal-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }

    #db-prompt-modal {
        background: #383838;
        padding: 30px 20px 20px;
        border-radius: 8px;
        width: 300px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        text-align: center;
        input {
            width: 100%;
            padding: 8px;
            margin-bottom: 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
            color: #fff;
            background-color: #1d1d1d;
        }
        button {
            background: #9d9d9d;
            color: white;
            padding: 8px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
    }
        
    .db-folder-list-modal-overlay {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    }
    .db-folder-list-modal {
        background-color: #383838;
        border-radius: 0.5rem;
        padding: 1rem;
        width: 300px;
        max-height: 300px;
        overflow-y: auto;
    }
    .db-folder-list-modal-header {
        font-size: 1.125rem; /* 18px */
        font-weight: 600;
        margin-bottom: 0.5rem;
    }
    .db-folder-list-modal-btn {
        display: flex;
        cursor: pointer;
        justify-content: space-between;
        width: 100%;
        text-align: left;
        padding-left: 1rem;
        padding-right: 1rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        border-radius: 5px;
        &:hover {
            background-color: #5e5e5e;
        }
        span {
            display: block;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
    }
    .db-folder-icon {
        margin-left: 0.5rem;
        font-size: 0.875rem; /* 14px */
    }
    .db-prompt-item {
        margin-left: 10px;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    .db-prompt-item-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 8px;
        // background: #262626;
        border-radius: 5px;
        font-size: 14px;
        &:hover {
            background: #262626;
        }
    }
    .db-folder-list-modal-buttons {
        display: flex;
        justify-content: space-around;
        margin-top: 1rem;
        button {
            border: 1px solid #9d9d9d;
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
            &:hover {
                background: #7a7a7a;
            }
        }
    }
    `;
    document.head.appendChild(style);
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
            folderBtn.innerText = '📁';
            folderBtn.className = 'db-folder-icon';

            folderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                chrome.storage.local.get(['folders'], (data) => {
                    let folders = data.folders || [];
                    const prompt = {
                        name: item.textContent.replace('📁', '').trim(),
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

            const title = document.createElement('span');
            title.className = "pointer"
            title.textContent = folder.folderName;
            const editFolderNameBtn = document.createElement('span');
            editFolderNameBtn.className = "pointer"
            editFolderNameBtn.textContent = '✏️';
            editFolderNameBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const folderNameElement = e.target.parentNode.parentNode.querySelector('span')
                if (folderNameElement.getAttribute('contenteditable') === 'true') {
                    editFolderNameBtn.textContent = '✏️';
                    console.log("Submitting folder name change to", folderNameElement.textContent);
                    folderNameElement.setAttribute('contenteditable', false);
                    const newFolderName = folderNameElement.textContent.trim();
                    if (! newFolderName || newFolderName === folder.folderName) {
                        folderNameElement.innerText = folder.folderName; // Reset to original name if empty
                        return;
                    }
                    chrome.storage.local.get(['folders'], (result) => {
                        let folders = result.folders || [];
                        folders = folders.map(f => {
                            if (f.folderName === folder.folderName) {
                                f.folderName = newFolderName;
                            }
                            return f;
                        });
                        syncFolders(folders);
                    });                    
                } else {
                    editFolderNameBtn.textContent = '💾';
                    console.log("Editing folder name");
                    folderNameElement.setAttribute('contenteditable', true)
                    folderNameElement.focus();
                }
            });
            const trashIcon = document.createElement('span');
            trashIcon.className = "pointer"
            trashIcon.textContent = '🗑️';
            trashIcon.addEventListener('click', (e) => {
                e.stopPropagation();
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
                console.log(folders);
                syncFolders(folders);
            });

            folderDiv.appendChild(folderItem);
            folderDiv.appendChild(promptList);
            container.appendChild(folderDiv);
        });
    });
}

function dummyDate() {
    const folders = [
        {
            "folderName": "folder1",
            "hidden": true,
            "prompts": [
                {"name": "prompt11", "link": "/c/68359cc4-dcd8-800f-9ab3-e42a018b0d0b"},
                {"name": "prompt12","link": "/c/68359cc4-dcd8-800f-9ab3-e42a01dss8b0d0d" },
                {"name": "prompt13","link": "/c/68359cc4-dcd8-800f-9ab3-e42a018ddb0d0d" },
                {"name": "prompt14","link": "/c/68359cc4-dcd8-800f-9ab3-e42a01ff8b0d0d" },
            ]
        },
        {
            "folderName": "folder2",
            "hidden": true,
            "prompts": []
        },
        {
            "folderName": "folder3",
            "hidden": true,
            "prompts": [
                {"name": "prompt31","link": "/c/68359cc4-dcd8-800f-9ab3-e42zza018b0d0c" },
                {"name": "prompt32","link": "/c/68359cc4-dcd8-800f-9ab3-e42a01ee8b0d0c" },
                {"name": "prompt34","link": "/c/68359cc4-dcd8-800f-9ab3-e42wwa018b0d0c" },
            ]
        }
    ]

    syncFolders(folders);
}


function addFolderIfNotExists(folderName, callback) {
    chrome.storage.local.get(['folders'], (result) => {
        let folders = result.folders || [];

        if (! folders.find(f => f.folderName === folderName)) {
            folders.push({ folderName, prompts: [] });
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

function showFolderModal() {
    // Create modal elements
    const overlay = document.createElement('div');
    overlay.id = 'db-prompt-modal-overlay';

    const modal = document.createElement('div');
    modal.id = 'db-prompt-modal';
    
    const createFolderBtn = document.createElement('button');
    createFolderBtn.textContent = 'Create';
    createFolderBtn.addEventListener('click', () => {
        const name = document.getElementById('prompt-folder-input').value.trim();
        if (name) {
            addFolderIfNotExists(name)
            document.body.removeChild(overlay);
            // renderFolders(document.getElementById('db-folders-with-prompts'));
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
    modal.appendChild(input);
    modal.appendChild(buttonsContainer);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    

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
        
        // DELETE LATER
        // dummyDate();

        // ✅ Watch for prompt items being added to the sidebar
        observeSidebarPrompts(sidebar);

    }, 500);
}



// Run on initial load
waitForSidebarAndInjectButton();
