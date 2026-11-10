/*
 * Four independent supporting-document pages.
 * The selected file names remain in the existing draft format.
 * File contents for local preview are additionally saved to IndexedDB, when available.
 * A filename left by an older version is never mistaken for an available file.
 */
(() => {
  'use strict';

  const index = Number(document.body.dataset.documentPage);
  if (!Number.isInteger(index) || index < 0 || index > 3) return;
  const account = typeof user === 'function' ? user() : null;
  if (!account || account.role !== 'student') {
    location.replace('login.html?role=student');
    return;
  }

  const next = ['document-catalogue.html', 'document-course.html', 'document-other.html', 'target-module.html'];
  const ids = ['gradeSheetFiles', 'moduleCatalogueFiles', 'courseDescriptionFiles', 'otherSupportingFiles'];
  const listIds = ['gradeSheetPreview', 'moduleCataloguePreview', 'courseDescriptionPreview', 'otherSupportingPreview'];
  const names = [
    'Copy of certificate of performance (grade sheet)',
    'Annotated module catalogue',
    'Contact info of person(s) responsible for the module and a link to the course description',
    'Others'
  ];
  const key = 'creditbridge_application_draft_' + account.id;
  const fileKey = key + ':' + ids[index];
  let draft = {};
  try { draft = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) {}

  const input = document.getElementById(ids[index]);
  const checked = document.getElementById('docChosen');
  const list = document.getElementById(listIds[index]);
  const error = document.getElementById('documentsMessage');
  const contact = document.getElementById('moduleContact');
  const other = document.getElementById('otherDocumentText');
  if (!input || !checked || !list || !error) return;
  if (contact) contact.value = draft.moduleContact || '';
  if (other) other.value = draft.otherDocuments || '';
  checked.checked = (draft.documentTypes || []).includes(names[index]);

  // The file input cannot be prefilled after a page reload. Keep actual File objects
  // separate from saved display-only names so Preview is never a broken button.
  let cachedFiles = [];
  // null means restored files are active; an array tracks the editable current selection.
  let manualFiles = null;
  let fileVersion = 0;
  let pendingWrite = Promise.resolve(true);
  let storageFailed = false;
  let modal = null;
  let previewUrl = null;
  let previouslyFocused = null;
  const info = document.createElement('p');
  info.className = 'cb-document-file-info';
  info.setAttribute('aria-live', 'polite');
  input.insertAdjacentElement('afterend', info);
  list.classList.add('cb-document-files');

  function openDatabase() {
    return new Promise(resolve => {
      if (!window.indexedDB) { resolve(null); return; }
      let request;
      try { request = indexedDB.open('creditbridge_document_file_previews', 1); }
      catch (_) { resolve(null); return; }
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('files')) request.result.createObjectStore('files');
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    });
  }
  const database = openDatabase();

  async function readStoredFiles() {
    const db = await database;
    if (!db) return [];
    return new Promise(resolve => {
      try {
        const transaction = db.transaction('files', 'readonly');
        const request = transaction.objectStore('files').get(fileKey);
        request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
        request.onerror = () => resolve([]);
        transaction.onabort = () => resolve([]);
      } catch (_) { resolve([]); }
    });
  }

  async function writeStoredFiles(files) {
    const db = await database;
    if (!db) return false;
    return new Promise(resolve => {
      try {
        const transaction = db.transaction('files', 'readwrite');
        if (files.length) transaction.objectStore('files').put(files, fileKey);
        else transaction.objectStore('files').delete(fileKey);
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => resolve(false);
        transaction.onabort = () => resolve(false);
      } catch (_) { resolve(false); }
    });
  }

  function selectedFiles() {
    return manualFiles === null ? cachedFiles : manualFiles;
  }
  function savedNames() {
    return (draft.documentFileNames || {})[ids[index]] || [];
  }
  function show(message) {
    error.textContent = message;
    error.classList.toggle('hidden', !message);
  }
  function save() {
    const current = (() => { try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) { return {}; } })();
    // Keep unrelated fields updated by other pages, while applying this page's state.
    draft = { ...current, ...draft };
    const types = new Set(draft.documentTypes || []);
    if (checked.checked) types.add(names[index]); else types.delete(names[index]);
    draft.documentTypes = [...types];
    if (!draft.documentFileNames) draft.documentFileNames = {};
    const files = selectedFiles();
    if (files.length) draft.documentFileNames[ids[index]] = files.map(file => file.name);
    if (!checked.checked) draft.documentFileNames[ids[index]] = [];
    if (contact) draft.moduleContact = contact.value.trim();
    if (other) draft.otherDocuments = other.value.trim();
    localStorage.setItem(key, JSON.stringify(draft));
  }

  function closePreview() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    const body = modal.querySelector('.cb-document-preview-content');
    body.replaceChildren();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    document.body.classList.remove('cb-document-preview-open');
    if (previouslyFocused?.isConnected) previouslyFocused.focus();
  }

  function getModal() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.className = 'cb-document-preview-overlay';
    modal.hidden = true;
    modal.innerHTML = `
      <section class="cb-document-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="cbPreviewTitle">
        <div class="cb-document-preview-header">
          <h2 id="cbPreviewTitle" data-no-translate></h2>
          <button type="button" class="cb-document-preview-close" aria-label="Close preview">×</button>
        </div>
        <div class="cb-document-preview-content"></div>
        <div class="cb-document-preview-actions">
          <a class="cb-document-preview-open" target="_blank" rel="noopener noreferrer">Open in new tab</a>
          <a class="cb-document-preview-download">Download file</a>
          <button type="button" class="cb-document-preview-done">Close preview</button>
        </div>
      </section>`;
    modal.addEventListener('click', event => { if (event.target === modal) closePreview(); });
    modal.querySelector('.cb-document-preview-close').addEventListener('click', closePreview);
    modal.querySelector('.cb-document-preview-done').addEventListener('click', closePreview);
    document.addEventListener('keydown', event => {
      if (modal.hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); closePreview(); }
      if (event.key === 'Tab') {
        const focusable = [...modal.querySelectorAll('button, a[href]')].filter(el => !el.hidden);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    document.body.appendChild(modal);
    return modal;
  }

  function openPreview(file) {
    closePreview();
    if (!file || !(file instanceof Blob)) return;
    const box = getModal();
    previouslyFocused = document.activeElement;
    const name = file.name || 'Document';
    box.querySelector('#cbPreviewTitle').textContent = name;
    const content = box.querySelector('.cb-document-preview-content');
    previewUrl = URL.createObjectURL(file);
    const suffix = name.split('.').pop().toLowerCase();
    if (suffix === 'pdf') {
      const frame = document.createElement('iframe');
      frame.title = 'PDF preview';
      frame.src = previewUrl;
      content.appendChild(frame);
    } else if (['png','jpg','jpeg'].includes(suffix)) {
      const image = document.createElement('img');
      image.alt = name;
      image.src = previewUrl;
      content.appendChild(image);
    } else {
      const message = document.createElement('p');
      message.className = 'cb-document-preview-fallback';
      message.textContent = 'Word documents cannot be previewed in this browser. Download the file to open it in Word or a compatible application.';
      content.appendChild(message);
    }
    const open = box.querySelector('.cb-document-preview-open');
    open.href = previewUrl;
    open.hidden = suffix === 'doc' || suffix === 'docx';
    const download = box.querySelector('.cb-document-preview-download');
    download.href = previewUrl;
    download.download = name;
    box.hidden = false;
    document.body.classList.add('cb-document-preview-open');
    box.querySelector('.cb-document-preview-close').focus();
  }

  function render() {
    list.replaceChildren();
    const actual = selectedFiles();
    const filenames = actual.length ? actual.map(file => file.name) : savedNames();
    for (let i = 0; i < filenames.length; i++) {
      const item = document.createElement('li');
      const label = document.createElement('span');
      label.className = 'cb-document-file-name';
      label.dataset.noTranslate = '';
      label.textContent = filenames[i];
      item.appendChild(label);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cb-document-preview-button';
      button.textContent = 'Preview';
      if (actual[i]) {
        button.addEventListener('click', () => openPreview(actual[i]));
      } else {
        button.disabled = true;
        button.title = 'Select this file again to preview it';
      }
      const actions = document.createElement('div');
      actions.className = 'cb-document-file-actions';
      actions.appendChild(button);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'cb-document-delete-button';
      remove.textContent = 'Delete';
      remove.setAttribute('aria-label', 'Delete ' + filenames[i]);
      remove.addEventListener('click', () => deleteFile(i));
      actions.appendChild(remove);
      item.appendChild(actions);
      list.appendChild(item);
    }
    if (!filenames.length) {
      const item = document.createElement('li');
      item.className = 'cb-document-file-empty';
      item.textContent = 'No files selected';
      list.appendChild(item);
    }
    info.textContent = actual.length
      ? (manualFiles !== null ? 'Files selected. Preview is available.' : 'Files restored from this browser. Preview is available.')
      : (filenames.length ? 'Only the file name was saved previously. Select the file again to enable preview.' : '');
    if (storageFailed && actual.length) info.textContent = 'Preview works now, but browser storage is unavailable. Select these files again after leaving this page.';
  }

  function queueFiles(files) {
    fileVersion++;
    cachedFiles = [];
    storageFailed = false;
    const captured = fileVersion;
    // Serialize file writes: a slower previous upload must not restore a deleted file.
    pendingWrite = pendingWrite.catch(() => false).then(() => writeStoredFiles(files)).then(ok => {
      if (captured === fileVersion && !ok && files.length) { storageFailed = true; render(); }
      return ok;
    });
  }

  // Delete one file, not the whole supporting-document category. The same update
  // clears the saved filename and the corresponding IndexedDB File object.
  function deleteFile(position) {
    const files = selectedFiles();
    const oldNames = savedNames();
    const namesShown = files.length ? files.map(f => f.name) : oldNames;
    const fileName = namesShown[position];
    if (!fileName) return;
    const german = localStorage.getItem('creditbridge_language') === 'de';
    const question = german
      ? `Datei „${fileName}“ aus diesem Antrag löschen?`
      : `Delete “${fileName}” from this application?`;
    if (!window.confirm(question)) return;

    if (files.length) {
      const remaining = files.filter((_, i) => i !== position);
      manualFiles = remaining;
      input.value = ''; // Do not leave removed files in the browser's native input.
      queueFiles(remaining);
      draft.documentFileNames ||= {};
      draft.documentFileNames[ids[index]] = remaining.map(file => file.name);
      if (!remaining.length) checked.checked = false;
    } else {
      // Old drafts can contain filenames without any stored file content.
      const remaining = oldNames.filter((_, i) => i !== position);
      draft.documentFileNames ||= {};
      draft.documentFileNames[ids[index]] = remaining;
      if (!remaining.length) checked.checked = false;
      manualFiles = [];
      queueFiles([]);
    }
    save();
    show('');
    render();
    info.textContent = german
      ? 'Datei entfernt. Die Änderung wurde im Entwurf gespeichert.'
      : 'File deleted. The change has been saved to your draft.';
  }

  function validate() {
    const files = selectedFiles();
    if (files.length > 5) return 'Choose up to five files.';
    for (const file of files) {
      if (file.size === 0 || file.size > 10 * 1024 * 1024)
        return 'Each file must be larger than 0 bytes and at most 10 MB.';
      if (!/\.(pdf|jpe?g|png|docx?)$/i.test(file.name)) return 'Unsupported file type.';
    }
    return '';
  }

  async function advance(skip) {
    show('');
    if (skip) {
      checked.checked = false;
      input.value = '';
      manualFiles = [];
      queueFiles([]);
    }
    const issue = validate();
    if (issue) { show(issue); return; }
    if (selectedFiles().length) checked.checked = true;
    // Do not treat a legacy filename as an uploaded document.
    if (checked.checked && !selectedFiles().length) {
      show('Please select the document again. Only its filename was saved in the older version.');
      return;
    }
    save();
    const persisted = await pendingWrite;
    if (!persisted && selectedFiles().length) {
      // Browsers may block IndexedDB on file:// pages or in private mode.
      // Keep existing navigation available; the UI clearly warns about re-selection.
      storageFailed = true;
      render();
    }
    if (index === 3) {
      const chosen = draft.documentTypes || [];
      if (!chosen.length) { show('Choose at least one document category and attach a file.'); return; }
      for (let i = 0; i < names.length; i++) {
        if (chosen.includes(names[i]) && !((draft.documentFileNames || {})[ids[i]] || []).length) {
          show('A selected category has no document. Open that category and upload a file.');
          return;
        }
      }
    }
    location.href = next[index];
  }

  input.addEventListener('change', () => {
    const files = Array.from(input.files);
    manualFiles = files;
    input.value = ''; // Allow selecting the same filename again after deletion.
    if (files.length) checked.checked = true;
    queueFiles(files);
    if (!files.length && draft.documentFileNames) draft.documentFileNames[ids[index]] = [];
    save();
    render();
    show('');
  });
  checked.addEventListener('change', () => {
    if (!checked.checked) { input.value = ''; manualFiles = []; queueFiles([]); }
    save();
    render();
    show(checked.checked && !selectedFiles().length
      ? 'Choose a document to complete this selected category.' : '');
  });
  document.getElementById('documentStepForm').addEventListener('submit', event => {
    event.preventDefault(); advance(false);
  });
  document.getElementById('docSkip').addEventListener('click', () => advance(true));
  document.getElementById('docSave').addEventListener('click', async () => {
    if (checked.checked && !selectedFiles().length) { show('Please select the document again or deselect this category.'); return; }
    const issue = validate();
    if (issue) { show(issue); return; }
    save();
    const persisted = await pendingWrite;
    show(persisted ? 'Draft saved.' : 'Draft details saved. File preview may not be available after leaving this page.');
  });
  async function navigateTo(event, enforceFiles) {
    if (enforceFiles && checked.checked && !selectedFiles().length) {
      event.preventDefault();
      show('Please select the document again or deselect this category before changing pages.');
      return;
    }
    event.preventDefault();
    save();
    await pendingWrite;
    location.href = event.currentTarget.href;
  }
  document.getElementById('docBack').addEventListener('click', event => navigateTo(event, false));
  document.querySelectorAll('.doc-step-button').forEach(button => {
    button.addEventListener('click', event => navigateTo(event, true));
  });

  render();
  const initVersion = fileVersion;
  readStoredFiles().then(files => {
    if (fileVersion !== initVersion || manualFiles !== null) return;
    const expected = savedNames();
    if (files.length === expected.length && files.every((file, i) => file instanceof Blob && file.name === expected[i])) {
      cachedFiles = files;
    }
    render();
  });
})();
