function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
    #db-folder-wrapper {
        width: calc(100% - 15px);
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin: 10px auto 0;
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
        cursor: pointer;
    //   margin: 5px 10px;
        padding: 6px;
        background: #262626;
        border-radius: 5px;
        font-size: 14px;
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
  `;
    document.head.appendChild(style);
}

function showFolderModal(callback) {
    // Create modal elements
    const overlay = document.createElement('div');
    overlay.id = 'db-prompt-modal-overlay';

    const modal = document.createElement('div');
    modal.id = 'db-prompt-modal';

    modal.innerHTML = `<input type="text" placeholder="Folder name" id="prompt-folder-input" />
                        <button id="prompt-create-folder">Create</button>`;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById('prompt-create-folder').addEventListener('click', () => {
        const name = document.getElementById('prompt-folder-input').value.trim();
        if (name) {
            callback(name);
            document.body.removeChild(overlay);
        }
    });

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
                    const folders = data.folders || [];
                    showFolderPicker(folders, (selectedFolder) => {
                        const promptTitle = item.textContent.trim();
                        chrome.storage.local.get(['folderPrompts'], (res) => {
                            const folderPrompts = res.folderPrompts || {};
                            folderPrompts[selectedFolder] = folderPrompts[selectedFolder] || [];
                            folderPrompts[selectedFolder].push(promptTitle);
                            chrome.storage.local.set({ folderPrompts });
                        });
                    });
                });
            });

            item.appendChild(folderBtn);
        });
    });

    observer.observe(sidebar, { childList: true, subtree: true });
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
        const btn = document.createElement('button');
        btn.textContent = folder;
        btn.className = 'db-folder-list-modal-btn';
        btn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            callback(folder);
        });
        modal.appendChild(btn);
    });

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function renderFoldersWithPrompts(container) {
    chrome.storage.local.get(['folders', 'folderPrompts'], (data) => {
        const folders = data.folders || [];
        const folderPrompts = data.folderPrompts || {};

        folders.forEach(folderName => {
            // Folder container
            const folderWrapper = document.createElement('div');
            folderWrapper.className = 'mt-2';

            // Folder header
            const folderHeader = document.createElement('div');
            folderHeader.className = 'db-folder-list-item';

            const folderTitle = document.createElement('span');
            folderTitle.textContent = folderName;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️';
            deleteBtn.className = 'text-red-500 hover:text-red-700 ml-2';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent toggle on delete click

                if (!confirm(`Delete folder "${folderName}" and all its prompts?`)) return;

                // Remove from storage
                const updatedFolders = folders.filter(f => f !== folderName);
                delete folderPrompts[folderName];

                chrome.storage.local.set({
                    folders: updatedFolders,
                    folderPrompts: folderPrompts
                }, () => {
                    // Remove from DOM
                    folderWrapper.remove();
                });
            });

            folderHeader.appendChild(folderTitle);
            folderHeader.appendChild(deleteBtn);

            // Prompt list (collapsible)
            const promptList = document.createElement('div');
            promptList.className = 'ml-4 mt-1 hidden';

            const prompts = folderPrompts[folderName] || [];
            prompts.forEach(prompt => {
                const link = document.createElement('a');
                link.href = '#'; // Optional: use saved link if you store it
                link.textContent = prompt;
                link.className = 'block text-blue-600 hover:underline text-sm my-1';
                promptList.appendChild(link);
            });

            folderHeader.addEventListener('click', () => {
                promptList.classList.toggle('hidden');
            });

            folderWrapper.appendChild(folderHeader);
            folderWrapper.appendChild(promptList);
            container.appendChild(folderWrapper);
        });
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

        const folderList = document.createElement('div');
        folderList.id = 'db-prompt-folder-list';

        button.addEventListener('click', () => {
            showFolderModal((folderName) => {
                chrome.storage.local.get(['folders'], (data) => {
                    const folders = data.folders || [];
                    if (!folders.includes(folderName)) {
                        folders.push(folderName);
                        chrome.storage.local.set({ folders }, () => {
                            const folderItem = document.createElement('div');
                            folderItem.className = 'db-folder-list-item';
                            folderItem.textContent = folderName;
                            folderList.appendChild(folderItem);
                        });
                    }
                });
            });
        });

        const foldersWrapper = document.createElement('div');
        foldersWrapper.id = 'db-folder-wrapper';
        foldersWrapper.append(button, folderList);
        sidebar.parentNode.insertBefore(foldersWrapper, sidebar);



        // // Load existing folders
        // chrome.storage.local.get(['folders'], (data) => {
        //     const folders = data.folders || [];
        //     folders.forEach((folderName) => {
        //         const folderItem = document.createElement('div');
        //         folderItem.className = 'db-folder-list-item';
        //         folderItem.textContent = folderName;
        //         folderList.appendChild(folderItem);
                
        //     });
        // });
        
        
        // 🆕 Show folders with prompts below
        const foldersWithPromptsContainer = document.createElement('div');
        foldersWithPromptsContainer.id = 'db-folders-with-prompts';
        foldersWrapper.appendChild(foldersWithPromptsContainer);

        // Render them
        renderFoldersWithPrompts(foldersWithPromptsContainer);

        // ✅ Watch for prompt items being added to the sidebar
        observeSidebarPrompts(sidebar);

    }, 500);
}



// Run on initial load
waitForSidebarAndInjectButton();
