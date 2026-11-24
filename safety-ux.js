/* CreditBridge: duplicate-safe form UX, unsaved changes and completeness tracking. */
(() => {
  'use strict';
  const page = location.pathname.split('/').pop().toLowerCase();
  const pages = ['apply.html','program.html','module.html','performance.html','documents.html','target-module.html','review.html','signature.html'];
  const step = pages.indexOf(page);
  const account = typeof user === 'function' ? user() : null;
  if (!account || account.role !== 'student') return;
  const key = 'creditbridge_application_draft_' + account.id;
  function read() { try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { return {}; } }
  const filled = value => typeof value === 'string' ? value.trim().length>0 : Boolean(value);
  const entries = d => Array.isArray(d.moduleEntries) ? d.moduleEntries : [];
  function complete(d) {
    const hasCurrent = filled(d.moduleEnglish)||filled(d.moduleGerman);
    const hasModules=entries(d).length>0;
    const documentNames=d.documentFileNames||{};
    const docsComplete = m => ['gradeSheetFiles', 'courseDescriptionFiles'].every(id =>
      Array.isArray(m.documentFileNames?.[id]) && m.documentFileNames[id].length > 0);
    const docs = docsComplete(d);
    return [filled(d.university),filled(d.program),hasCurrent||hasModules,
      (Number(d.ects)>0 && Number(d.sws)>=0)||hasModules,
      docs||entries(d).some(docsComplete),
      entries(d).length>0 || Boolean(d.targetModuleId && d.moduleType),
      hasModules,filled(d.studentSignatureDate) && filled(d.studentSignatureFileName)];
  }
  function notify(message,kind='success') {
    let toast=document.getElementById('cbSafetyToast');
    if (!toast) { toast=document.createElement('div');toast.id='cbSafetyToast';toast.className='cb-safety-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.append(toast); }
    toast.dataset.kind=kind;toast.textContent=message;toast.classList.add('visible');
    clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.classList.remove('visible'),3400);
  }
  if (step >= 0) {
    const anchor=document.querySelector('.wizard-step-title') || document.querySelector('main h1');
    if(anchor){
      const panel=document.createElement('section');panel.id='cbCompleteness';panel.className='cb-completeness';
      panel.setAttribute('aria-label','Application completeness');
      panel.innerHTML='<div class="cb-completeness-head"><strong>Application completeness</strong><span id="cbCompletenessCount"></span></div><progress id="cbCompletenessProgress" max="8" value="0"></progress><div id="cbCompletenessLabels" class="cb-completeness-labels"></div>';
      anchor.insertAdjacentElement('afterend',panel);
      const labels=['University','Programme','Previous course','Credits','Documents','THD module','Review','Signature'];
      const update=()=>{
        const d=read(),flags=complete(d);
        // The current step can be visually complete before its draft is autosaved.
        if(step===0)flags[0] ||= filled(document.getElementById('universityName')?.value);
        if(step===1)flags[1] ||= Boolean(document.querySelector('input[name="program"]:checked'));
        if(step===2)flags[2] ||= filled(document.getElementById('moduleEnglish')?.value)||filled(document.getElementById('moduleGerman')?.value);
        if(step===3)flags[3] ||= Number(document.getElementById('moduleEcts')?.value)>0;
        if(step===4) flags[4] ||= ['gradeSheetFiles', 'courseDescriptionFiles'].every(id =>
          (read().documentFileNames?.[id] || []).length > 0);
        if(step===5) flags[5] ||= Boolean(document.getElementById('targetModuleName')?.value && document.querySelector('input[name="moduleType"]:checked'));
        if(step===7)flags[7] ||= Boolean(document.getElementById('studentSignatureDate')?.value && document.getElementById('studentSignatureFile')?.files?.length);
        const count=flags.filter(Boolean).length;
        document.getElementById('cbCompletenessProgress').value=count;
        document.getElementById('cbCompletenessCount').textContent=count+' of 8 steps ready';
        document.getElementById('cbCompletenessLabels').replaceChildren(...labels.map((label,i)=>{
          const chip=document.createElement('span');chip.className='cb-check-chip'+(flags[i]?' done':'');chip.textContent=(flags[i]?'✓ ':'○ ')+label;return chip;
        }));
      };
      update();document.addEventListener('input',update);document.addEventListener('change',update);
      document.addEventListener('click',()=>setTimeout(update,100));
    }
    // Unsaved warning only when the browser has not yet autosaved an edited field.
    // Navigation through Next, Back, Save Draft and Submit is intentional.
    let dirty=false,timer=null,leavingIntentionally=false;
    const mark=e=>{
      if(!e.target.matches('input:not([type=file]),textarea,select'))return;
      dirty=true;clearTimeout(timer);
      timer=setTimeout(()=>{dirty=false;notify('Draft saved automatically.');},650);
    };
    document.addEventListener('input',mark);document.addEventListener('change',mark);
    document.addEventListener('submit',()=>{leavingIntentionally=true;dirty=false;},true);
    document.querySelectorAll('a[href],button').forEach(el=>{
      if(el.closest('.university-navigation') || el.textContent?.toLowerCase().includes('draft')){
        el.addEventListener('click',()=>{leavingIntentionally=true;dirty=false;},true);
      }
    });
    window.addEventListener('beforeunload',e=>{
      if(dirty && !leavingIntentionally){e.preventDefault();e.returnValue='';}
    });
    if(step===7){
      const button=document.querySelector('#signatureForm button[type=submit]');
      if(button) button.addEventListener('click',()=>{ if(document.getElementById('signatureForm').checkValidity()) notify('Checking application details…'); });
    }
  }
  if(page==='student-dashboard.html'){
    // Draft actions have their own workflow handler; show a confirmation for delete.
    document.addEventListener('click',e=>{if(e.target.textContent?.trim()==='Continue draft')notify('Opening your saved application…');});
  }
})();
