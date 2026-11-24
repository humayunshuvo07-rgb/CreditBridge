/* CreditBridge document selection checks. Browser-only file input validation. */
(() => {
  'use strict';
  if (!location.pathname.endsWith('/documents.html')) return;

  const form = document.getElementById('documentsForm');
  if (!form) return;
  const LIMIT = 10 * 1024 * 1024;
  const MAX_FILES = 5;
  const ACCEPTED = new Set(['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']);
  const inputs = [
    ['gradeSheetFiles', 'Grade sheet'],
    ['moduleCatalogueFiles', 'Module catalogue'],
    ['courseDescriptionFiles', 'Course description'],
    ['otherSupportingFiles', 'Other supporting documents']
  ];

  // A saved filename is not an uploaded file. Require a fresh selection after reload.
  const notice = document.createElement('p');
  notice.className = 'cb-upload-validation';
  notice.setAttribute('role', 'alert');
  notice.setAttribute('aria-live', 'polite');
  form.insertBefore(notice, form.firstChild);
  const helper = document.createElement('p');
  helper.className = 'muted small';
  helper.textContent = 'Required: grade sheet and course description. Maximum 10 MB per file, five files per category. Select files again after reopening a draft.';
  notice.after(helper);

  function error(message, input) {
    notice.textContent = message;
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.focus();
    }
  }

  function inspect(requireMandatory) {
    for (const [id, label] of inputs) {
      const input = document.getElementById(id);
      if (!input) continue;
      input.removeAttribute('aria-invalid');
      const files = [...input.files];
      if (files.length > MAX_FILES) return { message: `${label}: choose at most ${MAX_FILES} files.`, input };
      for (const file of files) {
        const extension = (file.name.split('.').pop() || '').toLowerCase();
        if (!ACCEPTED.has(extension)) return { message: `${label}: ${file.name} has an unsupported file type.`, input };
        if (file.size === 0) return { message: `${label}: ${file.name} is empty.`, input };
        if (file.size > LIMIT) return { message: `${label}: ${file.name} exceeds 10 MB.`, input };
      }
    }
    if (requireMandatory) {
      for (const [id, label] of inputs.filter((_, i) => i === 0 || i === 2)) {
        const input = document.getElementById(id);
        if (!input?.files?.length) return { message: `Please select a ${label.toLowerCase()} file to continue.`, input };
      }
    }
    return null;
  }

  form.addEventListener('change', event => {
    if (event.target?.type !== 'file') return;
    notice.textContent = '';
    const problem = inspect(false);
    if (problem) {
      error(problem.message, problem.input);
      // Discard invalid selections so they cannot accidentally be saved.
      problem.input.value = '';
      problem.input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  // Capture before other form handlers: stop Next when required files are missing.
  form.addEventListener('submit', event => {
    const problem = inspect(true);
    if (!problem) { notice.textContent = ''; return; }
    event.preventDefault();
    event.stopImmediatePropagation();
    error(problem.message, problem.input);
  }, true);
})();
