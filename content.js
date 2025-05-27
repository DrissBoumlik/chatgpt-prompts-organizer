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
    .db-prompt-item {
        margin-left: 1rem;
        margin-top: 0.25rem;
        display: none;
        flex-direction: column;
        gap: 0.25rem;
    }
    `;
    document.head.appendChild(style);
}

function showFolderModal() {
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
            addFolderIfNotExists(name)
            document.body.removeChild(overlay);
            renderFolders(document.getElementById('db-folders-with-prompts'));
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
                    showFolderPicker(folders);
                });
            });

            item.appendChild(folderBtn);
        });
    });

    observer.observe(sidebar, { childList: true, subtree: true });
}
function injectSaveButtonsIntoPrompts() {
    const prompts = document.querySelectorAll('#history a'); // ChatGPT prompts

    prompts.forEach(prompt => {
        if (prompt.parentNode.querySelector('.save-to-folder-btn')) return;

        const btn = document.createElement('button');
        btn.textContent = '➕';
        btn.className = 'save-to-folder-btn ml-1 text-sm text-green-600 hover:text-green-800';
        btn.title = 'Save this prompt to a folder';

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            showFolderSelectModal();
        });

        prompt.parentNode.appendChild(btn);
    });
}

function showFolderSelectModal() {
    chrome.storage.local.get(['folders'], (data) => {
        const folders = data.folders || [];

        const modal = document.createElement('div');
        modal.className = 'fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50';

        const box = document.createElement('div');
        box.className = 'bg-white p-4 rounded shadow max-w-xs w-full';

        const title = document.createElement('div');
        title.textContent = 'Select Folder';
        title.className = 'font-semibold mb-2';

        const select = document.createElement('select');
        select.className = 'w-full mb-4 p-1 border rounded';
        folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder;
            option.textContent = folder;
            select.appendChild(option);
        });

        const submit = document.createElement('button');
        submit.textContent = 'Save';
        submit.className = 'bg-blue-500 text-white px-3 py-1 rounded';
        submit.addEventListener('click', () => {
            debugger
            const selected = select.value;
            document.body.removeChild(modal);
            let folderName = selected;
            chrome.storage.local.get(['folders'], (data) => {
                const folders = data.folders || {};
                if (!folders[folderName]) folders[folderName] = [];

                const exists = folders[folderName].some(p => p.name === promptName && p.url === promptUrl);
                if (!exists) {
                    folders[folderName].push({ name: promptName, url: promptUrl });

                    chrome.storage.local.set({ folders }, () => {
                        console.log('Prompt saved to folder:', folderName);
                    });
                }
            });
        });

        box.append(title, select, submit);
        modal.appendChild(box);
        document.body.appendChild(modal);
    });
}


function showFolderPicker(folders) {
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
        btn.textContent = folder.folderName;
        btn.className = 'db-folder-list-modal-btn';
        btn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            const prompt = {name: item.textContent.trim(), link: item.href.trim() };
            chrome.storage.local.get(['folders'], (res) => {
                const folders = res.folders || [];
                folders.map((_folder) => {
                    if (_folder.folderName === folder.folderName) {
                        const promptExists = _folder.prompts.some((promptItem) => promptItem.link === prompt.link);
                        if (! promptExists) {
                            _folder.prompts.push(prompt);
                        }
                    }
                    return _folder;
                });
                chrome.storage.local.set({ folders });
            });
        });
        modal.appendChild(btn);
    });

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function renderFolders(container) {

    chrome.storage.local.get(['folders'], (result) => {
        const folders = result.folders || [];

        container.innerHTML = ''; // Clear existing

        folders.forEach(folder => {
            const folderDiv = document.createElement('div');
            
            // DELETE LATER
            if (typeof folder === 'string') {
                folder = {folderName: folder, prompts: []}
            }
            
            folder.prompts = [{
                "name": "prompt1",
                "link": "/c/68359cc4-dcd8-800f-9ab3-e42a018b0d0b"
            },{
                "name": "prompt2",
                "link": "/c/68359cc4-dcd8-800f-9ab3-e42a0aaaaaaa"
            }];
            
            // Folder header with toggle
            const header = document.createElement('div');
            header.className = 'db-folder-list-item';

            const title = document.createElement('span');
            title.textContent = folder.folderName;

            header.appendChild(title);

            // Prompts container (hidden initially)
            const promptList = document.createElement('div');
            promptList.className = 'db-prompt-item';

            folder.prompts.forEach(p => {
                const link = document.createElement('a');
                link.href = p.link;
                link.textContent = p.name;
                link.className = 'text-blue-600 hover:underline text-sm';
                promptList.appendChild(link);
            });

            header.addEventListener('click', () => {
                promptList.classList.toggle('hidden');
            });

            folderDiv.appendChild(header);
            folderDiv.appendChild(promptList);
            container.appendChild(folderDiv);
        });
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

function addPromptToFolder(folderName, promptName, promptLink, callback) {
    chrome.storage.local.get(['folders'], (result) => {
        let folders = result.folders || [];

        // Find folder
        const folder = folders.find(f => f.folderName === folderName);

        if (!folder) {
            // Folder not found, optionally create it then add prompt
            folders.push({
                folderName,
                prompts: [{ name: promptName, link: promptLink }]
            });
        } else {
            // Check if prompt exists in folder already (by name & link)
            const exists = folder.prompts.some(p => p.name === promptName && p.link === promptLink);
            if (!exists) {
                folder.prompts.push({ name: promptName, link: promptLink });
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
            showFolderModal();
        });

        const foldersWrapper = document.createElement('div');
        foldersWrapper.id = 'db-folder-wrapper';

        // 🆕 Show folders with prompts below
        const foldersWithPromptsContainer = document.createElement('div');
        foldersWithPromptsContainer.id = 'db-folders-with-prompts';
        foldersWrapper.append(button, foldersWithPromptsContainer);
        sidebar.parentNode.insertBefore(foldersWrapper, sidebar);

        // Render them
        renderFolders(foldersWithPromptsContainer);

        // ✅ Watch for prompt items being added to the sidebar
        observeSidebarPrompts(sidebar);

    }, 500);
}



// Run on initial load
waitForSidebarAndInjectButton();
