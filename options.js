document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('folders');
  // Load from storage
  chrome.storage.local.get('folders', (result) => {
    const folders = result.folders || {};
    textarea.value = JSON.stringify(folders, null, 2);
  });

  // Save to storage
  const saveButton = document.getElementById('save-button');
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
  
  const downloadButton = document.getElementById('backup-button');
  downloadButton.addEventListener('click', () => {
    try {
      const folders = JSON.parse(textarea.value); // Validate JSON
      console.log(folders);
      const blob = new Blob([JSON.stringify(folders, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'folders.json';
      a.click();

      URL.revokeObjectURL(url);
      alert("Data saved successfully! Check your downloads directory");
    } catch (e) {
      alert('Invalid JSON. Please check your input.');
    }
  });

  const uploadInput = document.getElementById('restore-backup');
  uploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result); // Validate JSON
        textarea.value = JSON.stringify(json, null, 2);
        alert('Data loaded successfully!');
      } catch (err) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  });

});
