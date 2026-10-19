"use strict";
// Browser-only interactive demonstration. No backend or database server is included.
const KEY='creditbridge_demo_v1';
function getDB(){try{const data=JSON.parse(localStorage.getItem(KEY));if(data&&Array.isArray(data.users)&&Array.isArray(data.applications))return data;}catch(e){}const fresh={users:[{id:1,name:'Demo Lecturer',email:'lecturer@demo.test',password:'Lecturer123!',role:'lecturer'},{id:2,name:'Study Center',email:'admin@demo.test',password:'Admin123!',role:'admin'}],applications:[],nextUser:3,nextApplication:1};setDB(fresh);return fresh;}
function setDB(db){localStorage.setItem(KEY,JSON.stringify(db));}
function user(){const id=Number(sessionStorage.getItem('creditbridge_uid'));return getDB().users.find(u=>u.id===id)||null;}
function go(url){location.href=url;}
function info(msg,good=false){const el=(document.getElementById('studentRegistration')?.classList.contains('hidden')===false ? document.getElementById('registrationMessage') : document.getElementById('message'));if(el){el.innerHTML='';const item=document.createElement('div');item.className='notice'+(good?' success':'');item.textContent=msg;el.appendChild(item);}}
function safe(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const current=user();if(current){document.getElementById('loginNav')?.classList.add('hidden');document.getElementById('registerNav')?.classList.add('hidden');document.getElementById('logoutNav')?.classList.remove('hidden');}document.getElementById('logoutNav')?.addEventListener('click',e=>{e.preventDefault();sessionStorage.removeItem('creditbridge_uid');go('index.html');});
const register=document.getElementById('registerForm');if(register)register.addEventListener('submit',e=>{e.preventDefault();const v=Object.fromEntries(new FormData(register));const db=getDB();if(db.users.some(u=>u.email===v.email.trim().toLowerCase()))return info('This email is already registered.');const firstName=v.first_name.trim();const lastName=v.last_name.trim();if(!firstName||!lastName)return info('Enter your first and last name.');const id=db.nextUser++;db.users.push({id,firstName,lastName,name:firstName+' '+lastName,number:v.number.trim(),email:v.email.trim().toLowerCase(),password:v.password,role:'student'});setDB(db);sessionStorage.setItem('creditbridge_uid',id);go('dashboard.html');});
// Both roles sign in on login.html; register.html is only for creating student accounts.
// The role is validated after the user selects Student or Employee.
const login = document.getElementById('loginForm');

// On login.html, choose Student or Employee first, then show the sign-in form.
const roleSelection = document.getElementById('roleSelection');
const roleSignIn = document.getElementById('roleSignIn');
if (roleSelection && roleSignIn) {
    const chosenRole = new URLSearchParams(location.search).get('role');
    const validRole = chosenRole === 'student' || chosenRole === 'employee';
    roleSelection.classList.toggle('hidden', validRole);
    roleSignIn.classList.toggle('hidden', !validRole);
    if (validRole) {
        document.getElementById('loginRole').value = chosenRole;
        document.getElementById('signInRoleHeading').textContent =
            chosenRole === 'student' ? 'STUDENT ACCESS' : 'EMPLOYEE ACCESS';
        document.getElementById('studentSignupLink').classList.toggle(
            'hidden', chosenRole !== 'student'
        );
    }
}
if(login)login.addEventListener('submit',e=>{e.preventDefault();const v=Object.fromEntries(new FormData(login));const u=getDB().users.find(u=>u.email===v.email.trim().toLowerCase()&&u.password===v.password);if(!u)return info('Incorrect email or password.');if((v.role==='student'&&u.role!=='student')||(v.role==='employee'&&u.role==='student'))return info('This account does not match the selected login type.');sessionStorage.setItem('creditbridge_uid',u.id);go('dashboard.html');});
// Employees review requests from their dashboard; only students create new applications.
// Hide all "New application" links for logged-in staff accounts.
if (current && current.role !== 'student') {
    document.querySelectorAll('a[href="apply.html"]').forEach(link => link.classList.add('hidden'));
}
const applicationForm=document.getElementById('applyForm');
if (applicationForm) {
    // Guests go directly to student sign-in. Staff cannot submit applications.
    if (!current || current.role !== 'student') {
        go('login.html?role=student');
    } else {
        applicationForm.addEventListener('submit', e => {
            e.preventDefault();
            const v = Object.fromEntries(new FormData(applicationForm));
            const db = getDB();
            const id = db.nextApplication++;
            db.applications.unshift({...v, id, studentId:current.id, status:'Pending review', createdAt:new Date().toLocaleString(), decisions:[]});
            setDB(db);
            go('application.html?id=' + id);
        });
    }
}
function statusClass(status){return status==='Approved'?'approved':status.includes('rejected')||status==='Rejected'?'rejected':'';}
if(document.getElementById('applicationsBody')){if(!current)go('login.html');else{const db=getDB();const all=db.applications;const apps=current.role==='student'?all.filter(a=>a.studentId===current.id):current.role==='lecturer'?all.filter(a=>a.status==='Pending review'):all.filter(a=>a.status==='Lecturer approved');document.getElementById('welcome').textContent='Welcome, '+current.name.split(' ')[0]+'.';document.getElementById('roleText').textContent=({student:'Student portal',lecturer:'Lecturer review portal',admin:'Study Center final approval portal'})[current.role];document.getElementById('dashboardHeading').textContent=current.role==='student'?'My applications':'Applications to review';document.getElementById('newButton').classList.toggle('hidden',current.role!=='student');document.getElementById('stats').innerHTML=`<div class="card"><div class="muted">Total requests</div><div class="number">${current.role==='student'?apps.length:all.length}</div></div><div class="card"><div class="muted">Waiting for action</div><div class="number">${apps.filter(a=>a.status==='Pending review'||a.status==='Lecturer approved').length}</div></div><div class="card"><div class="muted">Finalized</div><div class="number">${(current.role==='student'?apps:all).filter(a=>a.status==='Approved'||a.status==='Rejected'||a.status==='Lecturer rejected').length}</div></div>`;document.getElementById('applicationsBody').innerHTML=apps.length?apps.map(a=>`<tr><td>#${a.id}</td><td>${safe(a.originalCourse)}</td><td>${safe(a.targetCourse)}</td><td><span class="tag ${statusClass(a.status)}">${safe(a.status)}</span></td><td><a class="btn secondary" href="application.html?id=${a.id}">View</a></td></tr>`).join(''):'<tr><td colspan="5">No applications here yet.</td></tr>';}}
if(document.getElementById('applicationDetails')){if(!current)go('login.html');else{const db=getDB();const a=db.applications.find(a=>a.id===Number(new URLSearchParams(location.search).get('id')));if(!a||(current.role==='student'&&a.studentId!==current.id)){document.getElementById('applicationDetails').textContent='Application not found or access denied.';}else{const owner=db.users.find(u=>u.id===a.studentId);document.getElementById('applicationDetails').innerHTML=`<p><b>Application:</b> #${a.id}</p><p><b>Student:</b> ${safe(owner?.name)}</p><p><b>Original course:</b> ${safe(a.originalCourse)}</p><p><b>Institution:</b> ${safe(a.institution)}</p><p><b>Original ECTS:</b> ${safe(a.originalCredits)}</p><p><b>Target course:</b> ${safe(a.targetCourse)}</p><p><b>Target ECTS:</b> ${safe(a.targetCredits)}</p><p><b>Explanation:</b> ${safe(a.description)}</p><p><b>Status:</b> <span class="tag ${statusClass(a.status)}">${safe(a.status)}</span></p>`;document.getElementById('decisionHistory').innerHTML=(a.decisions.length?a.decisions.map(d=>`<div class="notice ${d.action==='Approved'?'success':''}"><b>${safe(d.by)}: ${safe(d.action)}</b><p>${safe(d.comment)}</p><small>${safe(d.date)}</small></div>`).join(''):'<p class="muted">No decisions yet.</p>');if((current.role==='lecturer'&&a.status==='Pending review')||(current.role==='admin'&&a.status==='Lecturer approved')){document.getElementById('reviewPanel').innerHTML='<h3>Review application</h3><form id="reviewForm"><label>Comments</label><textarea name="comment" required placeholder="Explain your decision"></textarea><div class="actions"><button class="btn" type="submit" name="action" value="Approved">Approve</button><button class="btn danger" type="submit" name="action" value="Rejected">Reject</button></div></form>';document.getElementById('reviewForm').addEventListener('submit',e=>{e.preventDefault();const action=e.submitter?.value;if(!action)return;const comment=e.currentTarget.elements.comment.value.trim();if(!comment)return;const latest=getDB();const target=latest.applications.find(x=>x.id===a.id);target.decisions.push({by:current.role==='lecturer'?'Lecturer':'Study Center',action,comment,date:new Date().toLocaleString()});target.status=current.role==='lecturer'?(action==='Approved'?'Lecturer approved':'Lecturer rejected'):action;setDB(latest);location.reload();});}}}}

// Registration on register.html always displays Create account.

