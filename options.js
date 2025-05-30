document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('folders');
  const saveButton = document.getElementById('save-button');

  // Load from storage
  chrome.storage.local.get('folders', (result) => {
    const folders = result.folders || {};
    textarea.value = JSON.stringify(folders, null, 2);
  });

  // Save to storage
  saveButton.addEventListener('click', () => {
    try {
      const folders = JSON.parse(textarea.value);
      chrome.storage.local.set({ folders }, () => {
        alert('Folders saved successfully!');
      });
    } catch (e) {
      alert('Invalid JSON. Please check your input.');
    }
  });
});
