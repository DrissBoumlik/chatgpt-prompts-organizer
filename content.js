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

    .db-folder-list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
    //   margin: 5px 10px;
        padding: 6px;
        background: #262626;
        border-radius: 5px;
        font-size: 14px;
    }
    .db-folder-list-item span:first-child, .db-prompt-item-link {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
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
        display: block;
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
    `;
    document.head.appendChild(style);
}






function renderFolders() {

    const container = document.getElementById('db-folders');
    chrome.storage.local.get(['folders'], (result) => {
        const folders = result.folders || [];

        container.innerHTML = ''; // Clear existing

        folders.forEach(folder => {
            const folderDiv = document.createElement('div');
            folderDiv.className = 'db-folder-container';
            
            // Folder header with toggle
            const header = document.createElement('div');
            header.className = 'db-folder-list-item';

            const title = document.createElement('span');
            title.className = "pointer"
            title.textContent = folder.folderName;
            const trashIcon = document.createElement('span');
            trashIcon.className = "pointer"
            trashIcon.textContent = '🗑️';
            trashIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                chrome.storage.local.get(['folders'], (result) => {
                    let folders = result.folders || [];
                    folders = folders.filter(f => f.folderName !== folder.folderName);
                    chrome.storage.local.set({ folders }, () => {
                        renderFolders();
                    });
                });
            });

            header.appendChild(title);
            header.appendChild(trashIcon);

            // Prompts container (hidden initially)
            const promptList = document.createElement('div');
            promptList.className = 'db-prompt-item hidden';

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
                                chrome.storage.local.set({ folders }, () => {
                                    renderFolders();
                                });
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
                promptList.classList.toggle('hidden');
            });

            folderDiv.appendChild(header);
            folderDiv.appendChild(promptList);
            container.appendChild(folderDiv);
        });
    });
}

function dummyDate() {
    const folders = [
        {
            "folderName": "folder1",
            "prompts": [
                {
                    "name": "prompt1",
                    "link": "/c/68359cc4-dcd8-800f-9ab3-e42a018b0d0b" 
                },
                {
                    "name": "prompt2",
                    "link": "/c/68359cc4-dcd8-800f-9ab3-e42a018b0d0d" 
                }
            ]
        },
        {
            "folderName": "folder2 very long name that should be truncated if it exceeds a certain length",
            "prompts": []
        },
        {
            "folderName": "folder3",
            "prompts": [
                {
                    "name": "prompt3 with a very long name that should be truncated if it exceeds a certain length",
                    "link": "/c/68359cc4-dcd8-800f-9ab3-e42a018b0d0c" 
                }
            ]
        }
    ]

    chrome.storage.local.set({ folders }, () => {
        renderFolders();
    });
}


function addFolderIfNotExists(folderName, callback) {
    chrome.storage.local.get(['folders'], (result) => {
        let folders = result.folders || [];

        if (!folders.find(f => f.folderName === folderName)) {
            folders.push({ folderName, prompts: [] });
            chrome.storage.local.set({ folders }, () => {
                if (callback) callback(folders);
            });
        } else {
            if (callback) callback(folders);
        }
    });
}

function addPromptToFolder(folderName, prompt, callback) {
    chrome.storage.local.get(['folders'], (result) => {
        let folders = result.folders || [];

        // Find folder
        const folder = folders.find(f => f.folderName === folderName);

        if (!folder) {
            // Folder not found, optionally create it then add prompt
            folders.push({
                folderName,
                prompts: [{ name: prompt.promptName, link: prompt.promptLink }]
            });
        } else {
            // Check if prompt exists in folder already (by name & link)
            const exists = folder.prompts.some(p => p.name === prompt.promptName && p.link === prompt.promptLink);
            if (!exists) {
                folder.prompts.push({ name: prompt.promptName, link: prompt.promptLink });
            }
        }

        chrome.storage.local.set({ folders }, () => {
            if (callback) callback(folders);
        });
    });
}



function waitForSidebarAndInjectButton() {
    const checkInterval = setInterval(() => {
        const sidebar = document.getElementById('history');

        if (!sidebar || document.getElementById('db-prompt-folder-btn')) {
            return;
        }
        
        // DELETE LATER
        if (document.querySelector('.folders-container')) {
            document.querySelector('.folders-container').remove();
        }

        clearInterval(checkInterval);
        injectStyles();

        const button = document.createElement('button');
        button.id = 'db-prompt-folder-btn';
        button.textContent = 'New Folder ➕';

        button.addEventListener('click', () => {
            // Show prompt to enter folder name
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
        dummyDate();

        // ✅ Watch for prompt items being added to the sidebar
        // observeSidebarPrompts(sidebar);

    }, 500);
}



// Run on initial load
waitForSidebarAndInjectButton();
