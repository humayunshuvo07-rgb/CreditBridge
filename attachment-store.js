/*
 * CreditBridge supporting documents, local-demo persistence.
 * Files live in IndexedDB under this browser origin. They are not accessible
 * from another device or browser profile without a real authenticated backend.
 */
(function () {
  'use strict';
  const TYPES = [
    ['gradeSheetFiles', 'Copy of certificate of performance (grade sheet)'],
    ['moduleCatalogueFiles', 'Annotated module catalogue'],
    ['courseDescriptionFiles', 'Contact information and course description'],
    ['otherSupportingFiles', 'Other supporting documents']
  ];
  const REQUIRED = new Set(['gradeSheetFiles', 'courseDescriptionFiles']);
  const moduleKey = (storageId, type) => 'creditbridge_module_files_' + storageId + ':' + type;
  const draftKey = (studentId, type) => 'creditbridge_application_draft_' + studentId + ':' + type;
  let dbPromise;
  function database() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(resolve => {
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
    return dbPromise;
  }
  async function read(key) {
    const db = await database();
    if (!db) return [];
    return new Promise(resolve => {
      try {
        const tx = db.transaction('files', 'readonly');
        const req = tx.objectStore('files').get(key);
        req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
        req.onerror = () => resolve([]);
        tx.onabort = () => resolve([]);
      } catch (_) { resolve([]); }
    });
  }
  async function write(key, files) {
    const db = await database();
    if (!db) return false;
    return new Promise(resolve => {
      try {
        const tx = db.transaction('files', 'readwrite');
        if (files.length) tx.objectStore('files').put(files, key);
        else tx.objectStore('files').delete(key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
        tx.onabort = () => resolve(false);
      } catch (_) { resolve(false); }
    });
  }
  const matching = (actual, expected) => Array.isArray(actual) && actual.length === expected.length &&
    actual.every((f, i) => f instanceof Blob && f.name === expected[i] && f.size > 0);
  const newId = () => (window.crypto && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID() : Date.now().toString(36) + '_' + Math.random().toString(36).slice(2);

  async function snapshot(studentId, id, documentFileNames) {
    const entries = TYPES.map(([type]) => [type, (documentFileNames || {})[type] || []]);
    // Validate before copying anything to avoid a half-saved module.
    for (const [type, names] of entries) {
      if (REQUIRED.has(type) && !names.length)
        throw new Error('A grade sheet and course description are required for each module.');
    }
    const data = [];
    for (const [type, names] of entries) {
      if (!names.length) { data.push([type, []]); continue; }
      const files = await read(draftKey(studentId, type));
      if (!matching(files, names)) throw new Error('Please reselect the file(s) in the ' + type.replace(/Files$/, '') + ' step. The saved filenames alone cannot be submitted.');
      data.push([type, files]);
    }
    for (const [type, files] of data) {
      if (!await write(moduleKey(id, type), files)) throw new Error('Could not save document contents. Enable browser storage and try again.');
    }
    return true;
  }
  async function restore(studentId, module) {
    for (const [type] of TYPES) {
      const expected = (module.documentFileNames || {})[type] || [];
      const files = module.documentStorageId ? await read(moduleKey(module.documentStorageId, type)) : [];
      // Old drafts might have filenames but no File objects. Allow editing so the
      // student can choose those files again in the supporting-document step.
      const restored = matching(files, expected) ? files : [];
      if (!await write(draftKey(studentId, type), restored)) throw new Error('Could not restore documents in this browser.');
    }
  }
  async function clearDraft(studentId) {
    for (const [type] of TYPES) await write(draftKey(studentId, type), []);
  }
  async function removeModule(module) {
    if (!module.documentStorageId) return;
    for (const [type] of TYPES) await write(moduleKey(module.documentStorageId, type), []);
  }
  async function validateModule(module) {
    for (const type of REQUIRED) {
      if (!((module.documentFileNames || {})[type] || []).length)
        throw new Error('A grade sheet and course description are required for each module.');
    }
    for (const [type] of TYPES) {
      const names = (module.documentFileNames || {})[type] || [];
      if (!names.length) continue;
      if (!module.documentStorageId || !matching(await read(moduleKey(module.documentStorageId, type)), names))
        throw new Error('Missing stored document for ' + (module.targetCourse || 'course') + '. Edit this module and upload the file again.');
    }
  }
  // Earlier versions saved actual files under the draft key, but only filenames on
  // submission. Recover old single-module requests where the original bytes remain.
  async function recoverLegacy(application, module) {
    if (module.documentStorageId || (application.modules || []).length > 1) return false;
    const entries = [];
    let available = false;
    for (const [type] of TYPES) {
      const names = (module.documentFileNames || {})[type] || [];
      const files = names.length ? await read(draftKey(application.studentId, type)) : [];
      if (names.length && !matching(files, names)) return false;
      if (files.length) available = true;
      entries.push([type, files]);
    }
    if (!available) return false;
    const id = newId();
    for (const [type, files] of entries) {
      if (!await write(moduleKey(id, type), files)) return false;
    }
    const db = getDB();
    const saved = db.applications.find(a => a.id === application.id);
    if (!saved) return false;
    if (Array.isArray(saved.modules) && saved.modules.length) saved.modules[0].documentStorageId = id;
    else saved.documentStorageId = id;
    setDB(db);
    module.documentStorageId = id;
    return true;
  }
  // Show readable filenames and new-tab access in student, lecturer and board views.
  async function render(application, container, modules, viewerName) {
    container.replaceChildren();
    const heading = document.createElement('h2');
    heading.textContent = 'Submitted supporting documents';
    container.append(heading);
    if (!modules.length) { container.append('No modules assigned to this reviewer.'); return; }
    for (const [index, module] of modules) {
      if (!module.documentStorageId) await recoverLegacy(application, module);
      const section = document.createElement('div');
      section.className = 'cb-submitted-module';
      const title = document.createElement('h3');
      title.textContent = 'Module ' + (index + 1) + ': ' + (module.targetCourse || module.originalCourse || 'Course');
      section.append(title);
      let count = 0;
      for (const [type, category] of TYPES) {
        const names = (module.documentFileNames || {})[type] || [];
        if (!names.length) continue;
        count += names.length;
        const categoryTitle = document.createElement('h4');
        categoryTitle.textContent = category;
        section.append(categoryTitle);
        const list = document.createElement('ul');
        list.className = 'cb-submitted-file-list';
        const actual = module.documentStorageId ? await read(moduleKey(module.documentStorageId, type)) : [];
        names.forEach((name, fileIndex) => {
          const li = document.createElement('li');
          const fileName = document.createElement('span');
          fileName.textContent = name;
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'btn secondary cb-file-new-tab';
          button.textContent = 'Open in new tab';
          const fileAvailable = matching(actual, names) && !!actual[fileIndex];
          button.disabled = !fileAvailable;
          if (fileAvailable) {
            button.addEventListener('click', () => {
              // Open synchronously within the click, avoiding popup blockers after IndexedDB awaits.
              const tab = window.open('about:blank', '_blank');
              if (!tab) { window.alert('Please allow pop-ups to open this document in a new tab.'); return; }
              tab.document.title = name;
              tab.document.body.textContent = 'Opening ' + name + '…';
              const suffix = name.toLowerCase().split('.').pop();
              const mime = {'pdf':'application/pdf','png':'image/png','jpg':'image/jpeg','jpeg':'image/jpeg','doc':'application/msword','docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}[suffix] || 'application/octet-stream';
              const blob = new Blob([actual[fileIndex]], {type:mime});
              const url = URL.createObjectURL(blob);
              tab.location.replace(url);
              // Keep object URLs available while the source page remains open.
              window.addEventListener('pagehide', () => URL.revokeObjectURL(url), {once:true});
            });
          } else {
            button.title = 'The file content was not saved in this browser. Ask the student to upload it again.';
          }
          li.append(fileName, button);
          if (!fileAvailable) {
            const warning = document.createElement('span');
            warning.className = 'cb-file-unavailable';
            warning.textContent = 'File unavailable in this browser';
            li.append(warning);
          }
          list.append(li);
        });
        section.append(list);
      }
      if (!count) {
        const empty = document.createElement('p');
        empty.className = 'muted';
        empty.textContent = 'No supporting documents listed.';
        section.append(empty);
      }
      container.append(section);
    }
    const note = document.createElement('p');
    note.className = 'muted small';
    note.textContent = 'Demo mode: files are available in the same browser and website origin. Cross-device access requires a secure server and file storage.';
    container.append(note);
  }
  window.CreditBridgeAttachments = {TYPES, newId, read, write, snapshot, restore, clearDraft, removeModule, validateModule, render};
})();
