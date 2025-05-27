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
    //   margin: 5px 10px;
      padding: 6px;
      background: #171717;
      border-radius: 4px;
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
  `;
    document.head.appendChild(style);
}

function showFolderModal(callback) {
    // Create modal elements
    const overlay = document.createElement('div');
    overlay.id = 'db-prompt-modal-overlay';

    const modal = document.createElement('div');
    modal.id = 'db-prompt-modal';

    modal.innerHTML = `
    <input type="text" placeholder="Folder name" id="prompt-folder-input" />
    <button id="prompt-create-folder">Create</button>
  `;

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
        folderList.id = 'prompt-folder-list';

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
        foldersWrapper.id = 'db-folder-wrapper'
        foldersWrapper.append(button);
        foldersWrapper.append(folderList);

        sidebar.parentNode.insertBefore(foldersWrapper, sidebar);



        // Load existing folders
        chrome.storage.local.get(['folders'], (data) => {
            const folders = data.folders || [];
            folders.forEach((f) => {
                const folderItem = document.createElement('div');
                folderItem.className = 'db-folder-list-item';
                folderItem.textContent = f;
                folderList.appendChild(folderItem);
            });
        });

    }, 500);
}



// Run on initial load
waitForSidebarAndInjectButton();
