'use strict';
/* CreditBridge student/employee workflow. All pages remain independent HTML files. */
(() => {
    const person = typeof user === 'function' ? user() : null;
    const page = location.pathname.split('/').pop().toLowerCase();
    const $ = id => document.getElementById(id);
    const text = value => String(value ?? '');
    const esc = value => typeof safe === 'function' ? safe(value) : text(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const draftKey = person ? `creditbridge_application_draft_${person.id}` : '';
    const stepPages = ['apply.html','program.html','module.html','performance.html','documents.html','target-module.html','review.html','signature.html'];
    const currentTime = () => new Date().toISOString();
    let submissionCompleted = false; // Prevent pagehide from recreating a submitted draft.
    const readDraft = () => {
        try { return JSON.parse(localStorage.getItem(draftKey) || '{}') || {}; }
        catch (_) { return {}; }
    };
    const saveDraft = draft => { draft.updatedAt = currentTime(); localStorage.setItem(draftKey, JSON.stringify(draft)); };
    const isStudent = person && person.role === 'student';
    const isEmployee = person && ['lecturer','admin'].includes(person.role);
    const getModules = application => Array.isArray(application.modules) && application.modules.length
        ? application.modules : [{
            originalCourse: application.originalCourse || '',
            originalCourseGerman: application.originalCourseGerman || '',
            originalCourseEnglish: application.originalCourseEnglish || '',
            targetCourse: application.targetCourse || '',
            originalCredits: application.originalCredits || '',
            sws: application.sws || '',
            targetCredits: application.targetCredits || '',
            moduleType: application.moduleType || '',
            documentTypes: application.documentTypes || [],
            documentFileNames: application.documentFileNames || {},
            documentStorageId: application.documentStorageId || '',
            description: application.description || '',
            assignedLecturers: application.assignedLecturers || (typeof reviewersForApplication === 'function' ? reviewersForApplication(application) : ['Demo Lecturer']),
            lecturerReviews: application.lecturerReviews || []
        }];
    const assignedToModule = (program, targetCourse) => {
        return findModuleLecturers(program, targetCourse);
    };
    const required = module => Array.isArray(module.assignedLecturers) ? module.assignedLecturers : [];
    const approvals = module => new Set((module.lecturerReviews || [])
        .filter(x => x.decision === 'recognized' && required(module).includes(x.reviewer)).map(x => x.reviewer)).size;
    const moduleStatus = (module, application) => {
        if ((module.lecturerReviews || []).some(x => x.decision === 'not-recognized')) return 'Rejected';
        if (!required(module).length) return 'Assignment pending';
        if (approvals(module) === required(module).length) return application?.status === 'Approved' ? 'Approved' : 'Lecturer approved';
        return 'Pending review';
    };
    const allApproved = application => getModules(application).every(module => required(module).length && moduleStatus(module,application) !== 'Rejected' && approvals(module) === required(module).length);
    const allReviewers = application => [...new Set(getModules(application).flatMap(module => required(module)))];
    const eligible = (application, module, reviewer) => application.status === 'Pending review' &&
        required(module).includes(reviewer) && !module.lecturerReviews?.some(x => x.reviewer === reviewer);
    const historyEvent = (application, label, actor, comment='', module='') => {
        application.history = application.history || [];
        application.history.push({at:currentTime(), label, actor, comment, module});
    };
    const itemsFromDraft = draft => Array.isArray(draft.moduleEntries) ? [...draft.moduleEntries] : [];
    const attachments = window.CreditBridgeAttachments || null;
    const attachmentError = 'Supporting documents could not be saved. Reload this page and upload the files again.';
    const makeModuleFromDraft = draft => ({
        originalCourse: draft.moduleEnglish || draft.moduleGerman || '',
        originalCourseGerman: draft.moduleGerman || '',
        originalCourseEnglish: draft.moduleEnglish || '',
        originalCredits: draft.ects || '',
        completedSemester: draft.completedSemester || '',
        completedYear: draft.completedYear || '',
        sws: draft.sws || '',
        targetCourse: draft.targetModule || '',
        targetCredits: draft.targetModuleEcts || '',
        targetModuleId: draft.targetModuleId || '',
        moduleType: draft.moduleType || '',
        documentTypes: draft.documentTypes || [],
        documentFileNames: draft.documentFileNames || {},
        documentStorageId: draft.documentStorageId || '',
        description: draft.moduleContact || draft.otherDocuments || '',
        assignedLecturers: assignedToModule(draft.program || '', draft.targetModule || ''),
        lecturerReviews: []
    });
    const error = (parent, message) => {
        let node = $('cbWorkflowError');
        if (!node) { node = document.createElement('p'); node.id='cbWorkflowError'; node.className='cb-alert'; node.setAttribute('role','alert'); parent.prepend(node); }
        node.textContent = message;
        node.scrollIntoView({behavior:'smooth', block:'nearest'});
    };
    const removeError = () => $('cbWorkflowError')?.remove();
    const draftFields = {
        'apply.html': [['universityName','university']],
        'module.html': [['moduleGerman','moduleGerman'],['moduleEnglish','moduleEnglish'],['completedSemester','completedSemester'],['completedYear','completedYear']],
        'performance.html': [['moduleSws','sws'],['moduleEcts','ects']],
        'documents.html': [['moduleContact','moduleContact'],['otherDocumentText','otherDocuments']],
        'target-module.html': [['targetModuleName','targetModuleId']],
        'signature.html': [['studentSignatureDate','studentSignatureDate']]
    };
    const saveVisible = () => {
        if (!isStudent || submissionCompleted) return;
        const draft = readDraft();
        for (const [id,key] of draftFields[page] || []) {
            const el = $(id);
            if (el) draft[key] = el.value;
        }
        if (page === 'program.html') draft.program = document.querySelector('input[name="program"]:checked')?.value || draft.program;
        if (page === 'target-module.html') {
            const sel = $('targetModuleName');
            const choice = sel?.selectedOptions[0];
            if (choice?.value) draft.targetModule = choice.textContent.trim();
            draft.moduleType = document.querySelector('input[name="moduleType"]:checked')?.value || draft.moduleType;
        }
        if (page === 'documents.html') {
            const legacyDocumentTypes = [...document.querySelectorAll('input[name="documentType"]')];
            if (legacyDocumentTypes.length) {
                draft.documentTypes = legacyDocumentTypes.filter(e => e.checked).map(e => e.value);
            }
            draft.documentFileNames = draft.documentFileNames || {};
            for (const id of ['gradeSheetFiles','moduleCatalogueFiles','courseDescriptionFiles','otherSupportingFiles']) {
                if ($(id)?.files?.length) draft.documentFileNames[id] = [...$(id).files].map(f=>f.name);
            }
        }
        draft.lastPage = page;
        saveDraft(draft);
    };
    // Student drafts can be continued or discarded from their own dashboard.
    if (isStudent && stepPages.includes(page)) {
        const draft = readDraft();
        draft.lastPage = page;
        saveDraft(draft);
        const actions = document.querySelector('.university-navigation') || document.querySelector('main .actions');
        if (actions) {
            const button = document.createElement('button');
            button.type = 'button'; button.className = 'btn secondary'; button.textContent = 'Save draft';
            button.addEventListener('click', () => {
                saveVisible();
                location.href = 'student-dashboard.html';
            });
            actions.append(button);
        }
        // Keep partially entered text when the student moves between pages or closes a tab.
        // Only serializable form values are retained. Browser File objects are not stored.
        let draftSaveTimer;
        const queueDraftSave = event => {
            if (!event.target.matches('input:not([type=file]), textarea, select')) return;
            clearTimeout(draftSaveTimer);
            draftSaveTimer = setTimeout(saveVisible, 350);
        };
        document.addEventListener('input', queueDraftSave);
        document.addEventListener('change', queueDraftSave);
        window.addEventListener('pagehide', () => {
            clearTimeout(draftSaveTimer);
            if (!submissionCompleted) saveVisible();
        });
    }
    if (page === 'student-dashboard.html' && isStudent) {
        const draft = readDraft();
        const parent = $('stats') || document.querySelector('main');
        const host = document.createElement('section'); host.id='cbDraftSection'; host.className='cb-strip';
        host.innerHTML = `<h2>My draft</h2><p class="muted small" id="cbDraftDescription"></p><div class="cb-toolbar" id="cbDraftActions"></div>`;
        parent.insertAdjacentElement('afterend',host);
        const filled = Object.keys(draft).some(key => !['lastPage','updatedAt'].includes(key));
        $('cbDraftDescription').textContent = filled
            ? `Last saved: ${draft.updatedAt ? new Date(draft.updatedAt).toLocaleString() : 'recently'} · ${itemsFromDraft(draft).length} completed module(s)`
            : 'No saved draft. Start a new application when you are ready.';
        if (filled) {
            const newButton = $('newButton');
            newButton?.addEventListener('click', event => {
                if (!confirm('Start a new application? Your current draft will be discarded.')) {
                    event.preventDefault();return;
                }
                localStorage.removeItem(draftKey);
            });
            const next = document.createElement('a'); next.className='btn';next.textContent='Continue draft';
            next.href = stepPages.includes(draft.lastPage) ? draft.lastPage : 'apply.html';
            const del = document.createElement('button');del.type='button';del.className='btn danger';del.textContent='Delete draft';
            del.addEventListener('click', () => { if (confirm('Delete your saved application draft?')) {localStorage.removeItem(draftKey);location.reload();} });
            $('cbDraftActions').append(next,del);
        }
    }
    // Every application uses one THD programme and its own module catalogue.
    if (page === 'program.html' && isStudent) {
        $('programForm')?.addEventListener('submit', event => {
            const selected = document.querySelector('input[name="program"]:checked')?.value;
            const draft = readDraft();
            if (draft.program && selected && draft.program !== selected && itemsFromDraft(draft).length) {
                event.preventDefault(); event.stopImmediatePropagation();
                if (!confirm('Changing programmes removes modules chosen for the previous programme. Continue?')) return;
                const fresh = {university:draft.university, program:selected, lastPage:'program.html'};
                saveDraft(fresh);
                location.href='module.html';
            }
        }, true);
    }
    // Attach a different set of previous-study modules to the same application.
    if (page === 'target-module.html' && isStudent) {
        const form = $('targetModuleForm');
        const controls = form?.querySelector('.actions') || form?.querySelector('.university-navigation');
        if (form && controls) {
            const another = document.createElement('button');
            another.type='button';another.id='cbAddModule';another.className='btn secondary';another.textContent='+ Save and add another course';
            controls.append(another);
            const note = document.createElement('div');note.className='cb-strip';note.id='cbSavedModules';note.setAttribute('aria-live','polite');
            form.parentElement.insertBefore(note,form);
            const render = () => {
                const entries=itemsFromDraft(readDraft());
                note.innerHTML = `<strong>${entries.length} module${entries.length===1?'':'s'} saved in this application</strong>`+
                    (entries.length ? `<ol class="cb-list">${entries.map((m,i)=>`<li class="cb-module"><strong>${esc(m.originalCourse || 'Previous course')}</strong> → ${esc(m.targetCourse || 'THD module')} <span class="cb-hint">(${esc(m.originalCredits)} ECTS)</span><div class="cb-toolbar"><button class="btn secondary" type="button" data-edit-saved="${i}">Edit</button><button class="btn danger" type="button" data-remove-saved="${i}">Remove</button></div></li>`).join('')}</ol>` : '<p class="muted">Your first selected course will appear here.</p>');
                note.querySelectorAll('[data-edit-saved]').forEach(button=>button.addEventListener('click',async ()=>{
                    const state=readDraft(),i=Number(button.dataset.editSaved),m=state.moduleEntries?.[i];
                    if(!m)return;
                    state.editModuleIndex=i;
                    Object.assign(state,{moduleGerman:m.originalCourseGerman,moduleEnglish:m.originalCourseEnglish,ects:m.originalCredits,sws:m.sws,targetModule:m.targetCourse,targetModuleId:m.targetModuleId,targetModuleEcts:m.targetCredits,moduleType:m.moduleType,documentTypes:m.documentTypes,documentFileNames:m.documentFileNames,moduleContact:m.description});
                    saveDraft(state);
                    try { if (!attachments) throw new Error(attachmentError); await attachments.restore(person.id, m); }
                    catch (problem) { error(form, problem.message); return; }
                    location.href='module.html';
                }));
                note.querySelectorAll('[data-remove-saved]').forEach(button=>button.addEventListener('click',async ()=>{
                    if (!confirm('Remove this course from your application?')) return;
                    const state=readDraft();const removed=state.moduleEntries?.splice(Number(button.dataset.removeSaved),1)[0];saveDraft(state);
                    if (removed && attachments) await attachments.removeModule(removed);
                    render();
                }));
            };
            render();
            const persistCurrent = async () => {
                removeError();
                const selected = $('targetModuleName')?.selectedOptions?.[0];
                const category = document.querySelector('input[name="moduleType"]:checked');
                const state = readDraft();
                if (!selected?.value || !category) {error(form,'Select a THD module and its module type.');return false;}
                if (!(state.moduleEnglish || state.moduleGerman)?.trim() || !(Number(state.ects)>0) || (state.sws && Number(state.sws)<0)) {error(form,'Enter a previous course name and valid ECTS/SWS values.');return false;}
                state.targetModule = selected.textContent.trim();
                state.targetModuleId = selected.value;
                state.targetModuleEcts = $('targetModuleInfo')?.textContent.match(/\d+(?:[.,]\d+)?\s+ECTS/i)?.[0]?.replace(/\s+ECTS/i,'') || state.targetModuleEcts || '';
                state.moduleType = category.value;
                const entries=itemsFromDraft(state);
                const item=makeModuleFromDraft(state);
                const position=Number(state.editModuleIndex);
                const existing = Number.isInteger(position) && position>=0 && position<entries.length ? entries[position] : null;
                item.documentStorageId = existing?.documentStorageId || (attachments && attachments.newId());
                try {
                    if (!attachments || !item.documentStorageId) throw new Error(attachmentError);
                    await attachments.snapshot(person.id, item.documentStorageId, item.documentFileNames);
                } catch (problem) { error(form, problem.message || attachmentError); return false; }
                if (existing) entries[position]=item;
                else entries.push(item);
                state.moduleEntries=entries;
                delete state.editModuleIndex;
                saveDraft(state);
                return true;
            };
            form.addEventListener('submit', async event => {
                event.stopImmediatePropagation();event.preventDefault();
                if (await persistCurrent()) location.href='review.html';
            }, true);
            another.addEventListener('click', async () => {
                if (!form.reportValidity() || !await persistCurrent()) return;
                await attachments.clearDraft(person.id);
                const state=readDraft();
                for (const field of ['moduleGerman','moduleEnglish','completedSemester','completedYear','sws','ects','targetModuleId','targetModule','targetModuleEcts','moduleType','documentTypes','documentFileNames','moduleContact','otherDocuments']) delete state[field];
                saveDraft(state);location.href='module.html';
            });
        }
    }
    if (page === 'review.html' && isStudent) {
        const draft = readDraft();
        if (!itemsFromDraft(draft).length && draft.targetModule && draft.ects) {
            draft.moduleEntries = [makeModuleFromDraft(draft)];
            saveDraft(draft);
        }
        const entries=itemsFromDraft(draft);
        const host=document.createElement('section');host.className='cb-strip';host.id='cbReviewModules';
        host.innerHTML='<h2>Modules in this application</h2><div id="cbModuleList"></div><div class="cb-toolbar" id="cbModuleActions"></div>';
        const target=$('nextToSignature');
        (target?.closest('.actions') || target?.parentElement)?.insertAdjacentElement('beforebegin',host);
        const render=()=>{
            const items=itemsFromDraft(readDraft());
            $('cbModuleList').innerHTML=items.length?`<ul class="cb-list">${items.map((m,i)=>`<li class="cb-module"><h3>${i+1}. ${esc(m.originalCourse)} → ${esc(m.targetCourse)}</h3><div class="cb-meta"><span>Previous: ${esc(m.originalCourseGerman || m.originalCourse)}</span><span>${esc(m.completedSemester||'')} ${esc(m.completedYear||'')} · ${esc(m.originalCredits)} ECTS / ${esc(m.sws)} SWS</span><span>${esc(m.moduleType)}</span></div>
                    <p class="cb-hint"><strong>Lecturers:</strong> ${esc(required(m).join(', '))}</p>
                    <p class="cb-hint"><strong>Documents:</strong> ${esc(Object.values(m.documentFileNames||{}).flat().join(', ') || 'None')}</p>
                    <div class="cb-toolbar"><button class="btn secondary" type="button" data-edit="${i}">Edit module</button><button class="btn danger" type="button" data-delete="${i}">Remove</button></div></li>`).join('')}</ul>`:'<p>No modules selected yet.</p>';
            $('cbModuleList').querySelectorAll('[data-edit]').forEach(button=>button.addEventListener('click',async ()=>{
                const index=Number(button.dataset.edit), draft=readDraft(),m=draft.moduleEntries[index];
                draft.editModuleIndex=index;
                Object.assign(draft,{moduleGerman:m.originalCourseGerman,moduleEnglish:m.originalCourseEnglish,ects:m.originalCredits,sws:m.sws,targetModule:m.targetCourse,targetModuleId:m.targetModuleId || '',targetModuleEcts:m.targetCredits,moduleType:m.moduleType,documentTypes:m.documentTypes,documentFileNames:m.documentFileNames,moduleContact:m.description});
                // Restore the module's programme catalogue ID by finding its code and name.
                const code=m.targetCourse.split(':')[0];
                const cat=$('catalogueData');
                if(cat){ /* The target-module page restores catalogue identifiers when reopened. */ }
                saveDraft(draft);
                try { if (!attachments) throw new Error(attachmentError); await attachments.restore(person.id, m); }
                catch (problem) { error(host, problem.message); return; }
                location.href='module.html';
            }));
            $('cbModuleList').querySelectorAll('[data-delete]').forEach(button=>button.addEventListener('click',async ()=>{
                const draft=readDraft();
                const removed=draft.moduleEntries.splice(Number(button.dataset.delete),1)[0];
                saveDraft(draft);
                if (removed && attachments) await attachments.removeModule(removed);
                render();
            }));
        };
        render();
        if (entries.length > 1) {
            // Details already shown in the per-module cards should not be mistaken for the whole batch.
            ['selectedModuleGerman','selectedModuleEnglish','selectedSws','selectedEcts'].forEach(id =>
                $(id)?.closest('.review-item')?.setAttribute('hidden',''));
            document.querySelectorAll('section.review-group').forEach(section => {
                if (['Supporting documents','Requested THD recognition'].includes(section.getAttribute('aria-label'))) section.hidden = true;
            });
        }
        $('backToTargetModule')?.addEventListener('click', async (event) => {
            event.preventDefault();
            const draft = readDraft();
            if (!itemsFromDraft(draft).length) return;
            const index = draft.moduleEntries.length - 1;
            const m = draft.moduleEntries[index];
            draft.editModuleIndex = index;
            Object.assign(draft,{moduleGerman:m.originalCourseGerman,moduleEnglish:m.originalCourseEnglish,
                ects:m.originalCredits,sws:m.sws,targetModule:m.targetCourse,targetModuleId:m.targetModuleId || '',
                targetModuleEcts:m.targetCredits,moduleType:m.moduleType,documentTypes:m.documentTypes,
                documentFileNames:m.documentFileNames,moduleContact:m.description});
            saveDraft(draft);
            try { if (!attachments) throw new Error(attachmentError); await attachments.restore(person.id, m); }
            catch (problem) { error(host, problem.message); return; }
            location.href='target-module.html';
        });
        const add=document.createElement('a');add.className='btn secondary';add.textContent='+ Add module';add.href='module.html';
        add.addEventListener('click',async (event)=>{
            event.preventDefault();
            if (attachments) await attachments.clearDraft(person.id);
            const state=readDraft();
            for(const field of ['moduleGerman','moduleEnglish','completedSemester','completedYear','sws','ects','targetModuleId','targetModule','targetModuleEcts','moduleType','documentTypes','documentFileNames','moduleContact','otherDocuments']) delete state[field];
            delete state.editModuleIndex;
            saveDraft(state);
            location.href='module.html';
        });
        $('cbModuleActions').append(add);
        target?.addEventListener('click',event=>{
            event.stopImmediatePropagation();event.preventDefault();
            if(!itemsFromDraft(readDraft()).length){error(host,'Add at least one module before signing.');return;}
            location.href='signature.html';
        },true);
    }
    // Validate file size and file type on the documents and signature steps.
    const checkedFormats = ['pdf','jpg','jpeg','png','doc','docx'];
    function validateUploads() {
        const inputs = [...document.querySelectorAll('input[type="file"]')];
        for (const input of inputs) {
            const signature=input.id==='studentSignatureFile';
            const formats=signature?['pdf','jpg','jpeg','png']:checkedFormats;
            for (const file of input.files) {
                const extension=file.name.split('.').pop().toLowerCase();
                if(!formats.includes(extension)) return `${file.name}: unsupported file format.`;
                if(file.size>(signature?5:10)*1024*1024) return `${file.name}: maximum ${signature?5:10} MB per file.`;
            }
            if(!signature && input.files.length>5) return `Choose no more than five files in ${input.id}.`;
        }
        return '';
    }
    if (page === 'documents.html' && isStudent) {
        const form=$('documentsForm');
        form?.addEventListener('submit',event=>{
            const invalid=validateUploads();
            const d=readDraft();
            const chosen=(d.documentTypes || []).length > 0;
            if (invalid || !chosen) {
                event.preventDefault();event.stopImmediatePropagation();
                error(form,invalid || 'Select at least one supporting document category.');
            }
        },true);
        form?.querySelectorAll('input[type=file]').forEach(input=>input.addEventListener('change',()=>{
            const problem=validateUploads();
            if(problem)error(form,problem);else removeError();
        }));
    }
    // Submit a single application containing all requested modules.
    if (page === 'signature.html' && isStudent) {
        const form=$('signatureForm');
        form?.addEventListener('submit',async event=>{
            event.preventDefault();event.stopImmediatePropagation();removeError();
            if (form.dataset.submitting === 'true') return;
            const err=validateUploads();
            if(err){error(form,err);return;}
            const selected=$('studentSignatureFile')?.files[0];
            const dated=$('studentSignatureDate')?.value;
            if (selected && selected.size === 0) {error(form,'The signature file is empty.');return;}
            if(!selected || !dated){error(form,'Enter the date and choose a signature file.');return;}
            const draft=readDraft();
            const modules=itemsFromDraft(draft);
            if(!draft.university || !draft.program || !modules.length){error(form,'Complete all application steps first.');return;}
            const unassigned=modules.filter(m=>!Array.isArray(m.assignedLecturers)||!m.assignedLecturers.length);
            if(unassigned.length){error(form,'Lecturer assignment is missing for: '+unassigned.map(m=>m.targetCourse).join(', ')+'. Please contact the study centre.');return;}
            // Upload names are not enough. Submit only if every listed file is genuinely stored.
            try {
                if (!attachments) throw new Error(attachmentError);
                for (const module of modules) await attachments.validateModule(module);
            } catch (problem) { error(form, problem.message || attachmentError); return; }
            // Avoid resubmitting a matching active request, even after refreshing the page.
            const fingerprint = JSON.stringify({studentId:person.id,university:draft.university,program:draft.program,
                modules:modules.map(m=>({course:m.originalCourse,target:m.targetModuleId||m.targetCourse,ects:m.originalCredits,year:m.completedYear})).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))});
            const currentDB=getDB();
            const previous=currentDB.applications.find(a=>a.studentId===person.id &&
                !['Withdrawn','Rejected','Lecturer rejected'].includes(a.status) && a.submissionFingerprint===fingerprint);
            if(previous){
                error(form,`This application was already submitted as #${previous.id}. Open your student dashboard instead of submitting it again.`);
                return;
            }
            if (form.dataset.submitting === 'true') return;
            if (!confirm(`Submit ${modules.length} course(s) for recognition? Please check all details before continuing.`)) return;
            form.dataset.submitting='true';
            const submitButton=form.querySelector('button[type=submit]');
            if(submitButton){submitButton.disabled=true;submitButton.textContent='Submitting…';}
            const message=$('signatureMessage');
            if(message){message.classList.remove('hidden');message.textContent='Saving your application…';message.setAttribute('role','status');}
            const db=getDB(),id=db.nextApplication++;
            const studentName=[person.firstName,person.lastName].filter(Boolean).join(' ')||person.name||'';
            const first=modules[0];
            const application={
                id,studentId:person.id,fullName:studentName,matriculationNumber:person.number||'',studentEmail:person.email,
                institution:draft.university,program:draft.program,originalCourse:first.originalCourse,
                originalCourseGerman:first.originalCourseGerman,originalCourseEnglish:first.originalCourseEnglish,
                originalCredits:first.originalCredits,sws:first.sws,targetCourse:first.targetCourse,targetCredits:first.targetCredits,
                moduleType:first.moduleType,documentTypes:first.documentTypes,documentFileNames:first.documentFileNames,
                documentStorageId:first.documentStorageId,
                description:first.description,modules,
                signatureDate:dated,signatureFileName:selected.name,submissionFingerprint:fingerprint,
                assignedLecturers:[...new Set(modules.flatMap(m=>required(m)))],lecturerReviews:[],
                reviewNotifications:modules.flatMap((m,i)=>required(m).map(reviewer=>({reviewer,moduleIndex:i,message:`New request: ${m.targetCourse}`,createdAt:currentTime(),acknowledged:false}))),
                status:'Pending review',createdAt:new Date().toLocaleString(),submittedAt:currentTime(),decisions:[],history:[]
            };
            historyEvent(application,'Submitted',studentName,`${modules.length} module(s) requested.`);
            try {
                db.applications.unshift(application);
                setDB(db);
            } catch (problem) {
                form.dataset.submitting='false';
                if(submitButton){submitButton.disabled=false;submitButton.textContent='Submit';}
                error(form,'Could not save this application. Check browser storage and try again.');
                return;
            }
            submissionCompleted = true;
            localStorage.removeItem(draftKey);
            location.href=`submitted.html?id=${id}`;
        },true);
    }
    // Existing requests remain available, while multi-module requests have per-module decisions.
    function renderModuleCards(application, interactive=false) {
        return `<ul class="cb-list">${getModules(application).map((m,i)=>{
            const state=moduleStatus(m,application),names=required(m);
            const statusClass=state==='Rejected'?'rejected':state==='Approved'?'approved':'';
            return `<li class="cb-module"><h3>${i+1}. ${esc(m.originalCourse)} → ${esc(m.targetCourse)}</h3>
                <div class="cb-meta"><span>${esc(m.completedSemester||'')} ${esc(m.completedYear||'')} · ${esc(m.originalCredits)} ECTS · ${esc(m.sws)} SWS</span><span class="tag ${statusClass}">${esc(state)}</span><span>${approvals(m)}/${names.length} lecturer approvals</span></div>
                <p class="cb-hint"><strong>Documents:</strong> ${esc(Object.values(m.documentFileNames||{}).flat().join(', ') || 'None selected')}</p>
                ${m.description?`<p class="cb-hint"><strong>Course description / contact:</strong> ${esc(m.description)}</p>`:''}
                <details class="cb-module-details"><summary>Lecturer decisions</summary><ul class="reviewer-status-list">${names.map(name=>{
                    const decision=(m.lecturerReviews||[]).find(r=>r.reviewer===name);
                    return `<li>${esc(name)}: <strong>${decision ? (decision.decision==='recognized'?'Approved':'Rejected') : 'Pending'}</strong>${decision?.grade?` · Grade ${esc(decision.grade)}`:''}${decision?.reason?` · ${esc(decision.reason)}`:''}</li>`;
                }).join('')}</ul></details>
                ${interactive&&person?.role==='lecturer'&&eligible(application,m,chosenReviewer())?`<a class="btn" href="lecturer-review.html?id=${application.id}&module=${i}">Review this module</a>`:''}</li>`;
        }).join('')}</ul>`;
    }
    if (page === 'lecturer-review.html') {
        const id=Number(new URLSearchParams(location.search).get('id'));
        const index=Number(new URLSearchParams(location.search).get('module')||0);
        const application=getDB().applications.find(a=>a.id===id);
        const module=application&&getModules(application)[index];
        const reviewer=chosenReviewer();
        const canDecide=person?.role==='lecturer' && application && module && eligible(application,module,reviewer);
        if(application && module){
            $('applicationSummary').textContent=`Application #${id} · Module ${index+1}/${getModules(application).length}: ${module.targetCourse}`;
            $('assignedLecturers').textContent=`Required lecturers: ${required(module).join(', ')} · ${approvals(module)}/${required(module).length} approved`;
        }
        if($('lecturerDecisionForm')) $('lecturerDecisionForm').hidden=!canDecide;
        if(!canDecide && $('applicationSummary')) $('applicationSummary').textContent+=' · No review action available for this lecturer.';
        $('lecturerDecisionForm')?.addEventListener('submit',event=>{
            event.preventDefault();event.stopImmediatePropagation();removeError();
            const decision=document.querySelector('input[name="decision"]:checked')?.value;
            const grade=$('recognitionGrade')?.value.trim(),reason=$('rejectionReason')?.value.trim();
            const date=$('lecturerDate')?.value, file=$('lecturerSignature')?.files?.[0];
            if(!decision || !date || !file || !file.size || !$('documentsChecked')?.checked || (decision==='recognized'&&!grade) || (decision==='not-recognized'&&!reason) || !/\.(pdf|png|jpe?g)$/i.test(file.name) || file.size>5*1024*1024){
                error($('lecturerDecisionForm'),'Select a decision, date, correct grade or reason, and a signature (PDF/JPG/PNG, max 5 MB).');return;
            }
            const db=getDB();const app=db.applications.find(a=>a.id===id);const mod=app&&getModules(app)[index];
            if(!app||!mod||person?.role!=='lecturer'||!eligible(app,mod,reviewer)){error($('lecturerDecisionForm'),'You cannot review this module.');return;}
            const entry={reviewer,decision,grade:decision==='recognized'?grade:'',reason:decision==='not-recognized'?reason:'',documentsChecked:true,date,signatureFileName:file.name};
            mod.lecturerReviews=mod.lecturerReviews||[];mod.lecturerReviews.push(entry);
            if(!Array.isArray(app.modules))app.modules=[mod];
            if(decision==='not-recognized')app.status='Lecturer rejected';
            else if(allApproved(app))app.status='Lecturer approved';
            else app.status='Pending review';
            // Retain compatibility with the original single-module reviewer state.
            app.lecturerReviews=[...new Map(app.modules.flatMap(m=>m.lecturerReviews||[]).map(r=>[r.reviewer,r])).values()];
            app.assignedLecturers=allReviewers(app);
            (app.reviewNotifications||[]).filter(n=>n.moduleIndex===index&&n.reviewer===reviewer).forEach(n=>n.acknowledged=true);
            const message=decision==='recognized'?`Grade: ${grade}`:reason;
            app.decisions=app.decisions||[];app.decisions.push({by:reviewer,action:decision==='recognized'?'Recognized':'Not recognized',comment:`${mod.targetCourse}. ${message}`,date});
            historyEvent(app,decision==='recognized'?'Lecturer approved':'Lecturer rejected',reviewer,message,mod.targetCourse);
            setDB(db);location.href='lecturer-dashboard.html';
        },true);
    }
    if (page === 'exam-board.html') {
        const id=Number(new URLSearchParams(location.search).get('id'));
        const app=getDB().applications.find(a=>a.id===id);
        const canFinish=person?.role==='admin' && app?.status==='Lecturer approved' && allApproved(app);
        if($('boardForm')) $('boardForm').hidden=!canFinish;
        if(app) $('applicationSummary').textContent=`Application #${id} · ${getModules(app).length} module(s) · ${allApproved(app)?'All lecturer decisions complete':'Waiting for lecturers'}`;
        $('boardForm')?.addEventListener('submit',event=>{
            event.preventDefault();event.stopImmediatePropagation();
            const file=$('boardSignature')?.files?.[0],date=$('boardDate')?.value;
            if(!canFinish || !date || !file || !file.size || !/\.(pdf|png|jpe?g)$/i.test(file.name) || file.size>5*1024*1024){error($('boardForm'),'Select a valid date and signature file (PDF/JPG/PNG, max 5 MB).');return;}
            const db=getDB(),item=db.applications.find(a=>a.id===id);
            if(!item || item.status!=='Lecturer approved' || !allApproved(item))return;
            item.status='Approved';item.examBoardConfirmation={date,signatureFileName:file.name,reviewer:person.name||person.email};
            item.decisions=item.decisions||[];item.decisions.push({by:person.name||person.email,action:'Approved',comment:'Examination board confirmation signed.',date});
            historyEvent(item,'Examination board approved',person.name||person.email,'Final decision issued.');
            setDB(db);location.href='exam-board-dashboard.html';
        },true);
    }
    // Offer a printable summary immediately after submission.
    if (page === 'submitted.html' && isStudent) {
        const id = Number(new URLSearchParams(location.search).get('id'));
        const submitted = getDB().applications.find(a => a.id === id && a.studentId === person.id);
        if (submitted) {
            const actions = document.querySelector('main .actions');
            if (actions) {
                const printLink = document.createElement('a');
                printLink.className = 'btn secondary';
                printLink.href = `print-application.html?id=${id}`;
                printLink.textContent = 'Print / Save as PDF';
                actions.append(printLink);
            }
        }
    }
    // Student and staff can inspect all module statuses and download a print-ready summary.
    if (page === 'application.html') {
        const id=Number(new URLSearchParams(location.search).get('id'));
        const app=getDB().applications.find(a=>a.id===id);
        if(app && (app.studentId===person?.id || person?.role==='admin' || (person?.role==='lecturer' && allReviewers(app).includes(chosenReviewer())))){
            if (getModules(app).length>1) {
                document.querySelector('.review-group[aria-label="Lecturer decisions"]')?.remove();
                if (person?.role==='lecturer') $('reviewPanel')?.replaceChildren();
            }
            const host=$('applicationDetails');
            if(host){
                const moduleSection=document.createElement('section');moduleSection.className='cb-strip';
                moduleSection.innerHTML=`<h2>Module recognition status</h2>${renderModuleCards(app,true)}`;
                host.insertAdjacentElement('afterend',moduleSection);
                const documentsSection=mountSubmittedFiles(app, moduleSection);
                const paper=document.createElement('a');paper.href=`print-application.html?id=${id}`;paper.className='btn secondary cb-no-print';paper.textContent='Print / Save as PDF';
                host.prepend(paper);
                const oldHistory = (app.history && app.history.length) ? app.history
                    : [{label:'Submitted',at:app.submittedAt||'',actor:app.fullName,comment:''},
                       ...(app.decisions||[]).map(d=>({label:d.action,at:d.date,actor:d.by,comment:d.comment}))];
                const timeline=document.createElement('section');timeline.className='cb-strip';
                timeline.innerHTML=`<h2>Application history</h2><div class="cb-timeline">${oldHistory.map(e=>`<div class="cb-event"><strong>${esc(e.label)}${e.module?' · '+esc(e.module):''}</strong><time>${esc(e.at?new Date(e.at).toLocaleString():app.createdAt)}</time><div>${esc(e.actor)} · ${esc(e.comment)}</div></div>`).join('')}</div>`;
                (documentsSection || moduleSection).insertAdjacentElement('afterend',timeline);
            }
        }
    }
    // Role-scoped supporting documents: each stored file opens in a NEW browser tab.
    // Lecturer sees only their assigned modules; the student and examination board see all.
    function mountSubmittedFiles(app, afterNode, selectedIndex = null) {
        if (!attachments || !app || !afterNode) return;
        const access = person && (app.studentId === person.id || person.role === 'admin' ||
            (person.role === 'lecturer' && allReviewers(app).includes(chosenReviewer())));
        if (!access) return;
        let modules = getModules(app).map((module,index) => [index,module]);
        if (person.role === 'lecturer') modules = modules.filter(([,m]) => required(m).includes(chosenReviewer()));
        if (selectedIndex !== null) modules = modules.filter(([index]) => index === selectedIndex);
        const section = document.createElement('section');
        section.className = 'cb-submitted-documents';
        section.setAttribute('aria-label', 'Submitted supporting documents');
        afterNode.insertAdjacentElement('afterend', section);
        attachments.render(app, section, modules).catch(() => {
            section.textContent = 'Could not load submitted documents. Browser storage may be unavailable.';
        });
        return section;
    }
    if (page === 'lecturer-review.html' && person?.role === 'lecturer') {
        const id = Number(new URLSearchParams(location.search).get('id'));
        const index = Number(new URLSearchParams(location.search).get('module') || 0);
        const app = getDB().applications.find(a => a.id === id);
        const place = document.getElementById('assignedLecturers');
        if (app && place) mountSubmittedFiles(app, place, index);
    }
    if (page === 'exam-board.html' && person?.role === 'admin') {
        const id = Number(new URLSearchParams(location.search).get('id'));
        const app = getDB().applications.find(a => a.id === id);
        const place = document.getElementById('applicationSummary');
        if (app && place) mountSubmittedFiles(app, place);
    }
    // Replace the staff inbox with a module-level action queue, and show draft-aware student rows.
    function dashboard() {
        const body=$('applicationsBody');if(!body || !person)return;
        const db=getDB();
        const staff=['employee-dashboard.html','lecturer-dashboard.html','exam-board-dashboard.html'].includes(page);
        if (!staff) {
            const applications=db.applications.filter(a=>a.studentId===person.id);
            body.innerHTML=applications.length?applications.map(a=>`<tr><td>#${a.id}</td><td>${esc(a.originalCourse)}${getModules(a).length>1?` <small>(+${getModules(a).length-1} more)</small>`:''}</td><td>${esc(a.targetCourse)}</td><td><span class="tag ${a.status==='Approved'?'approved':a.status.includes('rejected')?'rejected':''}">${esc(a.status)}</span><div class="muted small">${getModules(a).filter(m=>approvals(m)===required(m).length).length}/${getModules(a).length} modules accepted by lecturers</div></td><td><a class="btn secondary" href="application.html?id=${a.id}">View</a></td></tr>`).join(''):'<tr><td colspan="5">No applications yet.</td></tr>';
            // Display a dated history overview for every submitted student application.
            let historyPanel=$('studentHistoryOverview');
            if(!historyPanel){
                historyPanel=document.createElement('section');
                historyPanel.id='studentHistoryOverview';
                historyPanel.className='card cb-history-overview';
                historyPanel.setAttribute('aria-label','Application history');
                const table=body.closest('table');
                const parent=table?.closest('.table-wrap') || table;
                parent?.insertAdjacentElement('afterend',historyPanel);
            }
            const toEntries = app => (app.history && app.history.length ? app.history : [
                {label:'Submitted',at:app.submittedAt||'',actor:app.fullName||'',comment:''},
                ...(app.decisions||[]).map(d=>({label:d.action,at:d.date,actor:d.by,comment:d.comment}))
            ]).slice().sort((a,b)=>Date.parse(a.at||0)-Date.parse(b.at||0));
            const displayDate = at => {
                const parsed = Date.parse(at||'');
                return Number.isNaN(parsed)?'Date not recorded':new Date(parsed).toLocaleString();
            };
            historyPanel.innerHTML='<h2>Application History</h2>' + (applications.length?
                applications.map(app=>{
                    const entries=toEntries(app);
                    const last=entries[entries.length-1];
                    return `<details class="cb-history-item"><summary><strong>Application #${app.id}</strong> · ${esc(app.status)} <span class="muted small">· Last activity: ${esc(displayDate(last?.at))}</span></summary>
                        <ol class="cb-history-events">${entries.map(event=>`<li><strong>${esc(event.label)}</strong>${event.module?` · ${esc(event.module)}`:''}<br><time>${esc(displayDate(event.at))}</time> · ${esc(event.actor||'')}<div class="muted small">${esc(event.comment||'')}</div></li>`).join('')}</ol>
                        <a class="btn secondary" href="application.html?id=${app.id}">View application</a></details>`;
                }).join('') : '<p class="muted">No application history yet.</p>');
            return;
        }
        const reviewer=chosenReviewer();
        const lecturer=person.role==='lecturer';
        const filtered=[];
        db.applications.forEach(a=>getModules(a).forEach((m,index)=>{
            if(!lecturer || required(m).includes(reviewer))filtered.push({a,m,index});
        }));
        const categories=[['all','All'],['pending','Pending'],['waiting','Waiting for another lecturer'],['ready','Ready for board'],['approved','Approved'],['rejected','Rejected']];
        let currentFilter=sessionStorage.getItem('creditbridge_v2_filter')||'all';
        const category=({a,m})=>{
            if(a.status==='Approved')return 'approved';
            if(moduleStatus(m,a)==='Rejected'||a.status==='Lecturer rejected')return 'rejected';
            if(a.status==='Lecturer approved')return 'ready';
            return approvals(m)>0?'waiting':'pending';
        };
        const toolbar=$('cbQueueToolbar') || document.createElement('div');
        toolbar.id='cbQueueToolbar';toolbar.className='cb-toolbar';
        $('queueFilters')?.remove();
        if(!toolbar.isConnected)body.closest('.table-wrap')?.before(toolbar);
        toolbar.replaceChildren();
        categories.forEach(([key,label])=>{
            const btn=document.createElement('button');btn.type='button';btn.className='queue-filter';btn.setAttribute('aria-pressed',String(key===currentFilter));
            btn.textContent=`${label} (${filtered.filter(row=>key==='all'||category(row)===key).length})`;
            btn.addEventListener('click',()=>{sessionStorage.setItem('creditbridge_v2_filter',key);dashboard();});toolbar.append(btn);
        });
        const visible=filtered.filter(row=>currentFilter==='all'||category(row)===currentFilter);
        const head=document.querySelector('thead tr');
        if(head)head.innerHTML='<th scope="col">ID</th><th scope="col">Student</th><th scope="col">Module</th><th scope="col">Lecturer status</th><th scope="col">Actions</th>';
        body.innerHTML=visible.length?visible.map(({a,m,index})=>{
            const owner=db.users.find(u=>u.id===a.studentId);
            const mayReview=lecturer?eligible(a,m,reviewer):index===0&&a.status==='Lecturer approved'&&allApproved(a);
            const reviewURL=lecturer?`lecturer-review.html?id=${a.id}&module=${index}`:`exam-board.html?id=${a.id}`;
            return `<tr><td>#${a.id}</td><td>${esc(owner?.name||a.fullName)}</td><td>${esc(m.targetCourse)}<div class="muted small">${esc(m.originalCourse)}</div></td>
                <td><span class="tag">${esc(moduleStatus(m,a))}</span><div class="muted small">${approvals(m)}/${required(m).length} lecturers approved</div><details><summary>Reviewers</summary>${required(m).map(n=>`<div>${esc(n)}</div>`).join('')}</details></td>
                <td><a class="btn secondary" href="application.html?id=${a.id}">View</a>${mayReview?` <a class="btn" href="${reviewURL}">Review</a>`:''}</td></tr>`;
        }).join(''):'<tr><td colspan="5">No modules in this category.</td></tr>';
        if(lecturer && $('reviewerInboxCount')) $('reviewerInboxCount').textContent=`${filtered.filter(row=>eligible(row.a,row.m,reviewer)).length} review notification(s) for ${reviewer}.`;
    }
    if (['student-dashboard.html','employee-dashboard.html','lecturer-dashboard.html','exam-board-dashboard.html'].includes(page)) {
        dashboard();
        // The original selector recreates its own DOM; reapply this view afterwards.
        document.addEventListener('change',event=>{
            if(event.target?.id==='reviewerIdentity')setTimeout(dashboard,0);
        },true);
    }
    // Print a complete application record. The browser's Save as PDF creates the PDF.
    if (page === 'print-application.html') {
        const id = Number(new URLSearchParams(location.search).get('id'));
        const app = getDB().applications.find(item => item.id === id);
        const allowed = app && person && (app.studentId === person.id ||
            person.role === 'admin' ||
            (person.role === 'lecturer' && allReviewers(app).includes(chosenReviewer())));
        const target = $('cbPrintBody');
        if (!target) return;
        if (!allowed) {
            target.textContent = 'Application not found or access denied.';
            $('cbPrintButton')?.setAttribute('disabled', 'disabled');
            return;
        }
        const owner = getDB().users.find(account => account.id === app.studentId);
        const modules = getModules(app);
        const field = (name, value) => `<dt>${esc(name)}</dt><dd>${esc(value || 'Not provided')}</dd>`;
        const dateValue = value => {
            if (!value) return 'Pending';
            const parsed = new Date(value);
            return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString();
        };
        const moduleCards = modules.map((module, index) => {
            const reviewers = required(module);
            const decisions = reviewers.map(reviewer => {
                const record = (module.lecturerReviews || []).find(item => item.reviewer === reviewer);
                return `<tr><td>${esc(reviewer)}</td><td>${esc(record ? (record.decision === 'recognized' ? 'Approved' : 'Rejected') : 'Pending')}</td><td>${esc(record?.grade || '—')}</td><td>${esc(record?.reason || '—')}</td><td>${esc(record?.date || '—')}</td><td>${esc(record?.signatureFileName || '—')}</td></tr>`;
            }).join('');
            const docs = Object.entries(module.documentFileNames || {})
                .flatMap(([kind, files]) => (Array.isArray(files) ? files : [files]).map(file => `${kind}: ${file}`));
            return `<section class="cb-print-module">
                <h3>Module ${index + 1}: ${esc(module.targetCourse || 'Unspecified THD module')}</h3>
                <dl class="cb-print-fields">
                    ${field('Previously completed module', module.originalCourseEnglish || module.originalCourseGerman || module.originalCourse)}
                    ${field('Previous ECTS', module.originalCredits)}
                    ${field('SWS', module.sws)}
                    ${field('THD ECTS', module.targetCredits)}
                    ${field('Module type', module.moduleType)}
                    ${field('Description', module.description)}
                    ${field('Supporting documents', docs.join('; ') || 'Not listed')}
                    ${field('Lecturer review progress', `${approvals(module)} of ${reviewers.length} approved`)}
                </dl>
                <h4>Lecturer decisions</h4>
                <div class="cb-print-table-wrap"><table class="cb-print-table"><thead><tr><th>Lecturer</th><th>Decision</th><th>Grade</th><th>Reason</th><th>Date</th><th>Signature file</th></tr></thead><tbody>${decisions || '<tr><td colspan="6">Lecturer assignment pending</td></tr>'}</tbody></table></div>
            </section>`;
        }).join('');
        const board = app.examBoardConfirmation;
        const events = (app.history || []).map(item => `<tr><td>${esc(dateValue(item.at))}</td><td>${esc(item.label)}</td><td>${esc(item.actor || '')}</td><td>${esc(item.module || '')}</td><td>${esc(item.comment || '')}</td></tr>`).join('');
        target.innerHTML = `
            <p class="cb-print-eyebrow">CREDITBRIDGE / APPLICATION SUMMARY</p>
            <h1>Credit recognition application #${esc(app.id)}</h1>
            <p class="cb-print-status"><strong>Status:</strong> ${esc(app.status)} · <strong>Submitted:</strong> ${esc(dateValue(app.submittedAt || app.createdAt))}</p>
            <h2>Student details</h2>
            <dl class="cb-print-fields">
                ${field('Full name', owner?.name || app.fullName)}
                ${field('Matriculation number', owner?.number || app.matriculationNumber)}
                ${field('Email', owner?.email || app.studentEmail)}
                ${field('Previous university', app.institution)}
                ${field('THD programme', app.program)}
            </dl>
            <h2>Requested recognition (${modules.length} module${modules.length === 1 ? '' : 's'})</h2>
            ${moduleCards}
            <h2>Student declaration</h2>
            <dl class="cb-print-fields">${field('Date', app.signatureDate)}${field('Signature file', app.signatureFileName)}</dl>
            <h2>Examination board</h2>
            <dl class="cb-print-fields">
                ${field('Decision', board ? 'Approved' : 'Pending')}
                ${field('Chairperson', board?.reviewer)}
                ${field('Date', board?.date)}
                ${field('Signature file', board?.signatureFileName)}
            </dl>
            <h2>Application history</h2>
            <div class="cb-print-table-wrap"><table class="cb-print-table"><thead><tr><th>Date</th><th>Event</th><th>By</th><th>Module</th><th>Details</th></tr></thead><tbody>${events || '<tr><td colspan="5">No recorded events</td></tr>'}</tbody></table></div>
            <p class="cb-print-footnote">This summary shows the recorded application status at the time it was generated. Signature file names identify selected files; they are not embedded signatures.</p>`;
        $('cbPrintButton')?.addEventListener('click', () => window.print());
    }
    // Show a live lecturer assignment preview when selecting a THD module.
    if (page === 'target-module.html') {
        const picker = $('targetModuleName');
        const host = $('targetModuleInfo');
        if (picker && host) {
            const lecturerPreview = document.createElement('p');
            lecturerPreview.id = 'lecturerAssignmentPreview';
            lecturerPreview.className = 'cb-hint';
            lecturerPreview.setAttribute('aria-live', 'polite');
            host.insertAdjacentElement('afterend', lecturerPreview);
            const refresh = () => {
                const selected = picker.selectedOptions?.[0];
                const value = selected?.value;
                if (!value) { lecturerPreview.textContent = ''; return; }
                const moduleData = Array.isArray(window.THD_MODULES) ? window.THD_MODULES.find(m=>m.id===value) : null;
                const moduleLabel = moduleData ? `${moduleData.code}: ${moduleData.name}` : selected.textContent.trim();
                const names = assignedToModule(readDraft().program || '', moduleLabel);
                lecturerPreview.textContent = names.length ? 'Responsible lecturer(s): '+names.join(', ') : 'Lecturer assignment pending: contact the study centre.';
            };
            picker.addEventListener('change', refresh);
            setTimeout(refresh, 100);
        }
    }
})();
