"use strict";
// Browser-only interactive demonstration. No backend or database server is included.
const KEY='creditbridge_demo_v1';
function getDB(){try{const data=JSON.parse(localStorage.getItem(KEY));if(data&&Array.isArray(data.users)&&Array.isArray(data.applications))return data;}catch(e){}const fresh={users:[{id:1,name:'Demo Lecturer',email:'lecturer@demo.test',password:'Lecturer123!',role:'lecturer'},{id:2,name:'Study Center',email:'admin@demo.test',password:'Admin123!',role:'admin'}],applications:[],nextUser:3,nextApplication:1};setDB(fresh);return fresh;}
function setDB(db){localStorage.setItem(KEY,JSON.stringify(db));}
function user(){const id=Number(sessionStorage.getItem('creditbridge_uid'));return getDB().users.find(u=>u.id===id)||null;}
function go(url){location.href=url;}
function info(msg,good=false){const el=(document.getElementById('studentRegistration')?.classList.contains('hidden')===false ? document.getElementById('registrationMessage') : document.getElementById('message'));if(el){el.innerHTML='';const item=document.createElement('div');item.className='notice'+(good?' success':'');item.textContent=msg;el.appendChild(item);}}
function safe(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

// Lecturer routing, derived from the "Lecturers" fields in the supplied THD module guides.
// Names are identities for the local review queue; no email addresses are assumed.
const MULTI_LECTURER_MODULES = {
    "Industrial Engineering": {
        "IE-16|Intercultural Management": [
            "Prof. Dr. Michelle Cummings-Koether",
            "Franziska Durner"
        ],
        "IE-37|Bachelor Module": [
            "Prof. Dr. Michelle Cummings-Koether",
            "Bernadette Busler",
            "Franziska Durner"
        ],
        "IE-Elective|Process Optimization": [
            "Prof. Markus Hainthaler",
            "Prof. Dr. Tobias Bader"
        ]
    },
    "Energy Systems Engineering": {
        "ESE-10|Lab work in Natural Sciences": [
            "Prof. Dr. Raimund Brotsack",
            "Prof. Dr. Sascha Kreiskott"
        ],
        "ESE-11|Materials and Design": [
            "Prof. Dr. Thorsten Gerdes",
            "Prof. Markus Hainthaler"
        ],
        "ESE-21|Project Work II incl. Simulation and Design": [
            "Prof. Dr. Rui Li",
            "Prof. Dr. Stefan Mátéfi-Tempfli"
        ],
        "ESE-29|Power Grid Technologies": [
            "Prof. Dr. Stefan Mátéfi-Tempfli",
            "Wolfgang Schauer"
        ],
        "ESE-31|Smart Systems and Technologies": [
            "Prof. Dr. Stefan Mátéfi-Tempfli",
            "Wolfgang Schauer"
        ],
        "ESE-34|Grid Management": [
            "Prof. Dr. Matthias Huber",
            "Prof. Dr. Stefan Mátéfi-Tempfli"
        ],
        "ESE-Elective|Principles of Energy Systems Management": [
            "Prof. Dr. Matthias Huber",
            "Prof. Dr. Stefan Mátéfi-Tempfli"
        ],
        "ESE-Elective|Computer Simulation in Energy and Resource Economics": [
            "Prof. Dr. Rui Li",
            "Prof. Dr. Stefan Mátéfi-Tempfli"
        ],
        "ESE-Elective|Energy Economics Policy": [
            "Prof. Dr. Matthias Huber",
            "Prof. Dr. Stefan Mátéfi-Tempfli"
        ],
        "ESE-Elective|International Energy Regulations": [
            "Prof. Dr. Matthias Huber",
            "Prof. Dr. Stefan Mátéfi-Tempfli"
        ],
        "ESE-Elective|Process Optimization": [
            "Prof. Markus Hainthaler",
            "Norbert Sosnowsky"
        ]
    }
};
const THD_MODULE_ASSIGNMENTS = {
  "Industrial Engineering": {
    "IE-01": [
      "Ibrahim Bader"
    ],
    "IE-02": [
      "Prof. Dr. Sascha Kreiskott"
    ],
    "IE-03": [
      "Prof. Dr. Raimund Brotsack"
    ],
    "IE-04": [
      "Prof. Dr. Robert Feicht"
    ],
    "IE-05": [
      "Prof. Dr. Tobias Bader"
    ],
    "IE-06": [
      "Prof. Dr. Robert Feicht"
    ],
    "IE-08": [
      "Ibrahim Bader"
    ],
    "IE-09": [
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "IE-10": [
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "IE-11": [
      "Prof. Dr. Sascha Kreiskott"
    ],
    "IE-14": [
      "Prof. Dr. Robert Feicht"
    ],
    "IE-15": [
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "IE-16": [
      "Prof. Dr. Michelle Cummings-Koether",
      "Franziska Durner"
    ],
    "IE-17": [
      "Prof. Dr. Robert Feicht"
    ],
    "IE-18": [
      "Prof. Dr. Robert Feicht"
    ],
    "IE-20": [
      "Prof. Dr. Robert Feicht"
    ],
    "IE-21": [
      "Prof. Dr. Robert Feicht"
    ],
    "IE-22": [
      "Prof. Markus Hainthaler"
    ],
    "IE-23": [
      "Prof. Dr. Rui Li"
    ],
    "IE-24": [
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "IE-27": [
      "Prof. Dr. Rui Li"
    ],
    "IE-28": [
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "IE-29": [
      "Prof. Markus Hainthaler"
    ],
    "IE-30": [
      "Prof. Dr. Sascha Kreiskott"
    ],
    "IE-31": [
      "Prof. Dr. Raimund Brotsack"
    ],
    "IE-32": [
      "Prof. Dr. Sascha Kreiskott"
    ],
    "IE-37": [
      "Prof. Dr. Michelle Cummings-Koether",
      "Bernadette Busler",
      "Franziska Durner"
    ],
    "IE-Elective": [
      "Prof. Dr. Tobias Bader"
    ]
  },
  "Energy Systems Engineering": {
    "ESE-01": [
      "Ibrahim Bader"
    ],
    "ESE-02": [
      "Prof. Dr. Sascha Kreiskott"
    ],
    "ESE-03": [
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "ESE-04": [
      "Prof. Dr. Sascha Kreiskott"
    ],
    "ESE-05": [
      "Prof. Dr. Raimund Brotsack"
    ],
    "ESE-07": [
      "Ibrahim Bader"
    ],
    "ESE-08": [
      "Prof. Dr. Sascha Kreiskott"
    ],
    "ESE-09": [
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "ESE-10": [
      "Prof. Dr. Raimund Brotsack",
      "Prof. Dr. Sascha Kreiskott"
    ],
    "ESE-11": [
      "Prof. Dr. Thorsten Gerdes",
      "Prof. Markus Hainthaler"
    ],
    "ESE-12": [
      "Prof. Dr. Michelle Cummings-Koether"
    ],
    "ESE-15": [
      "Prof. Dr. Robert Feicht"
    ],
    "ESE-16": [
      "Prof. Dr. Rui Li"
    ],
    "ESE-17": [
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "ESE-18": [
      "Prof. Dr. Sascha Kreiskott"
    ],
    "ESE-19": [
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "ESE-21": [
      "Prof. Dr. Rui Li",
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "ESE-22": [
      "Prof. Dr. Raimund Brotsack"
    ],
    "ESE-23": [
      "Prof. Dr. Raimund Brotsack"
    ],
    "ESE-24": [
      "Prof. Markus Hainthaler"
    ],
    "ESE-26": [
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "ESE-28": [
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "ESE-29": [
      "Prof. Dr. Stefan Mátéfi-Tempfli",
      "Wolfgang Schauer"
    ],
    "ESE-30": [
      "Wolfgang Schauer"
    ],
    "ESE-31": [
      "Prof. Dr. Stefan Mátéfi-Tempfli",
      "Wolfgang Schauer"
    ],
    "ESE-32": [
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "ESE-33": [
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "ESE-34": [
      "Prof. Dr. Matthias Huber",
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "ESE-35": [
      "Anna Marquardt"
    ],
    "ESE-36": [
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "ESE-37": [
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "ESE-Elective": [
      "Prof. Markus Hainthaler"
    ]
  }
};
const THD_ELECTIVE_ASSIGNMENTS = {
  "Industrial Engineering": {
    "Business Planning and Start-Up Management": [
      "Prof. Dr. Tobias Bader"
    ],
    "Data Acquisition and Processing": [
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "Energy and Resource Efficiency": [
      "Prof. Dr. Rui Li"
    ],
    "Energy Markets": [
      "Prof. Dr. Rui Li"
    ],
    "Globalisation": [
      "Prof. Dr. Matthias Huber"
    ],
    "Industrial Automation and Information Technology": [
      "Wolfgang Schauer"
    ],
    "Insights into the Corporate World": [
      "Claudia Hageneder"
    ],
    "Modelling Theory": [
      "Prof. Dr. Robert Feicht"
    ],
    "Operational Processes": [
      "Prof. Dr. Rui Li"
    ],
    "Process Engineering": [
      "Prof. Markus Hainthaler"
    ],
    "Process Optimization": [
      "Prof. Markus Hainthaler"
    ]
  },
  "Energy Systems Engineering": {
    "Process Engineering": [
      "Prof. Markus Hainthaler"
    ],
    "Advanced Fluid and Energy Technology": [
      "Prof. Dr. Rui Li"
    ],
    "Principles of Energy Systems Management": [
      "Prof. Dr. Matthias Huber"
    ],
    "Operational Processes": [
      "Prof. Dr. Rui Li"
    ],
    "Computer Simulation in Energy and Resource": [
      "Prof. Dr. Rui Li"
    ],
    "Energy Economics Policy": [
      "Prof. Dr. Matthias Huber"
    ],
    "International Energy Regulations": [
      "Prof. Dr. Matthias Huber"
    ],
    "Health Safety Environment": [
      "Prof. Dr. Rui Li"
    ],
    "Technology and Intellectual Property Rights": [
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "MRO-Strategies and Process Reliability": [
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "Entrepreneurship": [
      "Prof. Dr. Stefan Mátéfi-Tempfli"
    ],
    "Strategic Planning and Project Management": [
      "Prof. Dr. Michelle Cummings-Koether"
    ],
    "Finance and Accounting": [
      "Prof. Dr. Robert Feicht"
    ],
    "Safety and Security in Energy Systems": [
      "Prof. Dr. Rui Li"
    ],
    "Energy and Ressource Efficiency": [
      "Prof. Dr. Rui Li"
    ],
    "Process Optimization": [
      "Prof. Markus Hainthaler"
    ],
    "Modelling Theory": [
      "Prof. Dr. Robert Feicht"
    ]
  }
};
const REVIEWER_CHOICE_KEY = 'creditbridge_reviewer';
const DEFAULT_REVIEWER = 'Demo Lecturer';
function reviewerList() {
    return [DEFAULT_REVIEWER, ...new Set([
        ...Object.values(MULTI_LECTURER_MODULES).flatMap(modules => Object.values(modules).flat()),
        ...Object.values(THD_MODULE_ASSIGNMENTS).flatMap(modules => Object.values(modules).flat()),
        ...Object.values(THD_ELECTIVE_ASSIGNMENTS).flatMap(modules => Object.values(modules).flat())
    ])].sort((a,b) =>
        a === DEFAULT_REVIEWER ? -1 : b === DEFAULT_REVIEWER ? 1 : a.localeCompare(b));
}
function chosenReviewer() {
    const value = sessionStorage.getItem(REVIEWER_CHOICE_KEY) || DEFAULT_REVIEWER;
    return reviewerList().includes(value) ? value : DEFAULT_REVIEWER;
}
function reviewersForApplication(application) {
    // Persist assigned reviewers on submission, so subsequent editing won't re-route decisions.
    if (Array.isArray(application.assignedLecturers) && application.assignedLecturers.length)
        return application.assignedLecturers;
    const programme = application.program || '';
    const moduleName = (application.targetCourse || '').trim();
    const collection = MULTI_LECTURER_MODULES[programme] || {};
    const match = Object.entries(collection).find(([key]) =>
        key.replace('|', ': ').toLowerCase() === moduleName.toLowerCase());
    return match ? match[1] : [DEFAULT_REVIEWER];
}
// Return lecturer names for a selected module, retaining every named co-lecturer.
// Missing assignments are left unassigned and flagged rather than sent to a random lecturer.
function findModuleLecturers(program, targetCourse) {
    const label = String(targetCourse || '').trim();
    const multi = MULTI_LECTURER_MODULES[program] || {};
    const norm = x => String(x).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    const special = Object.entries(multi).find(([key]) => norm(key.replace('|', ': ')) === norm(label));
    if (special) return [...new Set(special[1])];
    const [code, ...rest] = label.split(':');
    const name = rest.join(':').trim();
    let names = [];
    if (/elective/i.test(code || '')) {
        const electives = THD_ELECTIVE_ASSIGNMENTS[program] || {};
        const entry = Object.entries(electives).find(([key]) => norm(key) === norm(name) ||
            (norm(key).length > 18 && norm(name).startsWith(norm(key))));
        names = entry?.[1] || [];
    } else {
        names = THD_MODULE_ASSIGNMENTS[program]?.[String(code||'').trim()] || [];
    }
    return [...new Set(names.filter(Boolean))];
}
function lecturerReviews(application) {
    return Array.isArray(application.lecturerReviews) ? application.lecturerReviews : [];
}
function lecturerProgress(application) {
    // Count decisions per module. The same lecturer may review several distinct modules.
    if (Array.isArray(application.modules) && application.modules.length) {
        const required = application.modules.flatMap(module => module.assignedLecturers || []);
        const reviews = application.modules.flatMap(module => module.lecturerReviews || []);
        const approved = application.modules.reduce((count, module) => {
            const accepted = new Set((module.lecturerReviews || [])
                .filter(entry => entry.decision === 'recognized').map(entry => entry.reviewer));
            return count + (module.assignedLecturers || []).filter(name => accepted.has(name)).length;
        }, 0);
        return { required, reviews, approved };
    }
    const required = reviewersForApplication(application);
    const reviews = lecturerReviews(application);
    const accepted = reviews.filter(entry => entry.decision === 'recognized' && required.includes(entry.reviewer));
    return { required, reviews, approved: new Set(accepted.map(item => item.reviewer)).size };
}
function hasAllLecturerApprovals(application) {
    const progress = lecturerProgress(application);
    // Old one-lecturer records remain viewable; multi-lecturer approvals require separate records.
    if (progress.required.length === 1 && application.status === 'Lecturer approved' &&
        !Array.isArray(application.lecturerReviews)) return true;
    return progress.approved === progress.required.length;
}
function canLecturerReview(application, name = chosenReviewer()) {
    return application.status === 'Pending review' && (Array.isArray(application.modules) ? application.modules.some(m => (m.assignedLecturers || []).includes(name) && !(m.lecturerReviews || []).some(r => r.reviewer === name)) : reviewersForApplication(application).includes(name) && !lecturerReviews(application).some(entry => entry.reviewer === name));
}

const current=user();if(current){document.getElementById('loginNav')?.classList.add('hidden');document.getElementById('registerNav')?.classList.add('hidden');document.getElementById('logoutNav')?.classList.remove('hidden');}document.getElementById('logoutNav')?.addEventListener('click',e=>{e.preventDefault();sessionStorage.removeItem('creditbridge_uid');go('index.html');});
const register=document.getElementById('registerForm');if(register)register.addEventListener('submit',e=>{e.preventDefault();const v=Object.fromEntries(new FormData(register));const db=getDB();if(db.users.some(u=>u.email===v.email.trim().toLowerCase()))return info('This email is already registered.');const firstName=v.first_name.trim();const lastName=v.last_name.trim();if(!firstName||!lastName)return info('Enter your first and last name.');const id=db.nextUser++;db.users.push({id,firstName,lastName,name:firstName+' '+lastName,number:v.number.trim(),email:v.email.trim().toLowerCase(),password:v.password,role:'student'});setDB(db);sessionStorage.setItem('creditbridge_uid',id);go('student-dashboard.html');});
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
if(login)login.addEventListener('submit',e=>{e.preventDefault();const v=Object.fromEntries(new FormData(login));const u=getDB().users.find(u=>u.email===v.email.trim().toLowerCase()&&u.password===v.password);if(!u)return info('Incorrect email or password.');if((v.role==='student'&&u.role!=='student')||(v.role==='employee'&&u.role==='student'))return info('This account does not match the selected login type.');sessionStorage.setItem('creditbridge_uid',u.id);go(u.role==='student'?'student-dashboard.html':u.role==='lecturer'?'lecturer-dashboard.html':'exam-board-dashboard.html');});
// Employees review requests from their dashboard; only students create new applications.
// Hide all "New application" links for logged-in staff accounts.
if (current && current.role !== 'student') {
    document.querySelectorAll('a[href="apply.html"]').forEach(link => link.classList.add('hidden'));
}
// Application pages each own their form handlers in their HTML files.
// The shared workflow.js manages multi-module submissions and staff decisions.

// Return the visible colour class for an application status.
function statusClass(status) {
    return status === 'Approved' ? 'approved' :
        (status === 'Rejected' || status === 'Lecturer rejected') ? 'rejected' : '';
}

// Track the staff filter during page refreshes and reviewer changes.
let employeeQueueFilter = sessionStorage.getItem('creditbridge_queue_filter') || 'all';

function queueCategory(application) {
    if (application.status === 'Approved') return 'approved';
    if (['Rejected', 'Lecturer rejected'].includes(application.status)) return 'rejected';
    if (application.status === 'Lecturer approved' && hasAllLecturerApprovals(application)) return 'ready';
    return lecturerProgress(application).approved > 0 ? 'waiting' : 'pending';
}

// Show a separate decision status for every lecturer named in the module guide.
function reviewerStatusMarkup(application) {
    const progress = lecturerProgress(application);
    return `<ul class="reviewer-status-list" aria-label="Lecturer approvals">
        ${progress.required.map(name => {
            const review = progress.reviews.find(item => item.reviewer === name);
            const state = review?.decision === 'recognized' ? 'Approved'
                : review?.decision === 'not-recognized' ? 'Rejected' : 'Pending';
            const style = state === 'Approved' ? 'approved' : state === 'Rejected' ? 'rejected' : '';
            return `<li><span class="reviewer-name">${safe(name)}</span>
                <span class="tag ${style}">${state}</span></li>`;
        }).join('')}
    </ul>`;
}

// Render student applications and the filtered employee decision queue.
function renderDashboard() {
    const body = document.getElementById('applicationsBody');
    if (!body) return;
    if (!current) { go('login.html'); return; }
    const employeePage = Boolean(document.getElementById('staffReviewLinks'));
    if (employeePage && current.role === 'student') { go('student-dashboard.html'); return; }
    if (employeePage && location.pathname.endsWith('lecturer-dashboard.html') && current.role !== 'lecturer') { go('exam-board-dashboard.html'); return; }
    if (employeePage && location.pathname.endsWith('exam-board-dashboard.html') && current.role !== 'admin') { go('lecturer-dashboard.html'); return; }
    if (!employeePage && current.role !== 'student') { go(current.role==='lecturer'?'lecturer-dashboard.html':'exam-board-dashboard.html'); return; }

    const db = getDB();
    const all = db.applications;
    const fullName = [current.firstName, current.lastName].filter(Boolean).join(' ') || current.name || current.email;
    document.getElementById('welcome').textContent = 'Welcome, ' + fullName + '.';
    document.getElementById('roleText').textContent = ({
        student: 'Student portal', lecturer: 'Lecturer review portal', admin: 'Examination board review portal'
    })[current.role] || 'Employee portal';
    document.getElementById('dashboardHeading').textContent =
        employeePage ? 'Applications and decisions' : 'My applications';
    document.getElementById('newButton')?.classList.toggle('hidden', employeePage);

    // The lecturer inbox includes current and earlier decisions for the selected reviewer.
    // A lecturer receives one independent inbox entry for every assigned module.
    if (employeePage && current.role === 'lecturer') {
        let inbox = document.getElementById('moduleNotifications');
        if (!inbox) {
            inbox = document.createElement('section');
            inbox.id = 'moduleNotifications';
            inbox.className = 'card';
            const panel = document.getElementById('reviewerPanel');
            (panel || document.getElementById('stats')).insertAdjacentElement('afterend', inbox);
        }
        const reviewer = chosenReviewer();
        const requests = all.flatMap(app => (Array.isArray(app.modules) ? app.modules : [{
            targetCourse: app.targetCourse, assignedLecturers: reviewersForApplication(app),
            lecturerReviews: app.lecturerReviews || []
        }]).flatMap((mod, index) => {
            const assigned = mod.assignedLecturers || [];
            const recorded = (mod.lecturerReviews || []).find(x => x.reviewer === reviewer);
            if (!assigned.includes(reviewer) || recorded) return [];
            if (!['Pending review'].includes(app.status)) return [];
            return [{app,mod,index}];
        }));
        inbox.innerHTML = `<h2>Module notifications <span class="tag">${requests.length}</span></h2>` +
            (requests.length ? `<ul class="cb-list">${requests.map(({app,mod,index}) =>
                `<li><strong>#${app.id}: ${safe(mod.targetCourse)}</strong> · ${safe(app.fullName)}
                    <a class="btn" href="lecturer-review.html?id=${app.id}&module=${index}">Review module</a></li>`).join('')}</ul>` :
                '<p class="muted">No new module requests for this lecturer.</p>');
    }
    const assigned = current.role === 'student'
        ? all.filter(a => a.studentId === current.id)
        : current.role === 'lecturer'
            ? all.filter(a => reviewersForApplication(a).includes(chosenReviewer()))
            : all;
    const actionable = a => current.role === 'lecturer'
        ? canLecturerReview(a)
        : current.role === 'admin' && queueCategory(a) === 'ready';
    const pendingCount = current.role === 'student'
        ? assigned.filter(a => ['Pending review', 'Lecturer approved'].includes(a.status)).length
        : assigned.filter(actionable).length;
    const finalized = assigned.filter(a => ['Approved', 'Rejected', 'Lecturer rejected'].includes(a.status)).length;
    document.getElementById('stats').innerHTML = `
        <div class="card"><div class="muted">Total requests</div><div class="number">${assigned.length}</div></div>
        <div class="card"><div class="muted">${employeePage ? 'Needs your action' : 'In progress'}</div><div class="number">${pendingCount}</div></div>
        <div class="card"><div class="muted">Finalized</div><div class="number">${finalized}</div></div>`;

    if (employeePage) {
        const reviewerPanel = document.getElementById('reviewerPanel');
        if (reviewerPanel && current.role === 'lecturer') {
            reviewerPanel.innerHTML = `<label for="reviewerIdentity"><strong>Lecturer notifications</strong></label>
                <select id="reviewerIdentity" aria-label="Choose lecturer identity"></select>
                <p class="muted small inbox-note" id="reviewerInboxCount" aria-live="polite"></p>`;
            const selector = document.getElementById('reviewerIdentity');
            reviewerList().forEach(name => selector.add(new Option(name, name)));
            selector.value = chosenReviewer();
            selector.addEventListener('change', () => {
                sessionStorage.setItem(REVIEWER_CHOICE_KEY, selector.value);
                renderDashboard();
            });
            const newRequests = assigned.filter(a => canLecturerReview(a));
            document.getElementById('reviewerInboxCount').textContent =
                `${newRequests.length} pending notification${newRequests.length === 1 ? '' : 's'} for ${chosenReviewer()}.`;
        } else if (reviewerPanel) reviewerPanel.replaceChildren();

        const toolbarHost = document.querySelector('.table-wrap');
        let toolbar = document.getElementById('queueFilters');
        if (!toolbar && toolbarHost) {
            toolbar = document.createElement('div');
            toolbar.id = 'queueFilters';
            toolbar.className = 'queue-toolbar';
            toolbar.setAttribute('role', 'group');
            toolbar.setAttribute('aria-label', 'Filter applications by status');
            toolbarHost.before(toolbar);
        }
        const categories = [
            ['all', 'All'], ['pending', 'Pending'], ['waiting', 'Waiting for other lecturer'],
            ['ready', 'Ready for board'], ['approved', 'Approved'], ['rejected', 'Rejected']
        ];
        if (!categories.some(([key]) => key === employeeQueueFilter)) employeeQueueFilter = 'all';
        if (toolbar) {
            toolbar.replaceChildren();
            categories.forEach(([key, label]) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'queue-filter';
                button.dataset.queueFilter = key;
                button.setAttribute('aria-pressed', String(employeeQueueFilter === key));
                button.textContent = label;
                const count = document.createElement('small');
                count.textContent = String(key === 'all' ? assigned.length : assigned.filter(a => queueCategory(a) === key).length);
                button.append(count);
                button.addEventListener('click', () => {
                    employeeQueueFilter = key;
                    sessionStorage.setItem('creditbridge_queue_filter', key);
                    renderDashboard();
                });
                toolbar.append(button);
            });
        }
        const visible = assigned.filter(a => employeeQueueFilter === 'all' || queueCategory(a) === employeeQueueFilter);
        const labels = ['ID', 'Student', 'Original course', 'Target course', 'Status', 'Actions'];
        document.querySelector('thead tr').innerHTML = labels.map(label => `<th scope="col">${label}</th>`).join('');
        body.innerHTML = visible.length ? visible.map(a => {
            const owner = db.users.find(u => u.id === a.studentId);
            const studentName = owner?.name || a.fullName || a.studentEmail || 'Student';
            const progress = lecturerProgress(a);
            const canAct = actionable(a);
            const url = current.role === 'lecturer' ? 'lecturer-review.html' : 'exam-board.html';
            return `<tr><td>#${a.id}</td><td>${safe(studentName)}</td>
                <td>${safe(a.originalCourse)}</td><td>${safe(a.targetCourse)}</td>
                <td><span class="tag ${statusClass(a.status)}">${safe(a.status)}</span>
                    <div class="muted small">${progress.approved}/${progress.required.length} lecturers approved</div>
                    <details><summary class="small">View lecturer decisions</summary>${reviewerStatusMarkup(a)}</details>
                </td><td><a class="btn secondary" href="application.html?id=${a.id}">View</a>
                ${canAct ? `<a class="btn" href="${url}?id=${a.id}">Review</a>` : ''}</td></tr>`;
        }).join('') : '<tr><td colspan="6">No applications in this category.</td></tr>';
    } else {
        body.innerHTML = assigned.length ? assigned.map(a => {
            const progress = lecturerProgress(a);
            return `<tr><td>#${a.id}</td><td>${safe(a.originalCourse)}</td>
                <td>${safe(a.targetCourse)}</td><td><span class="tag ${statusClass(a.status)}">${safe(a.status)}</span>
                <div class="muted small">${progress.approved}/${progress.required.length} lecturer approvals</div></td>
                <td><a class="btn secondary" href="application.html?id=${a.id}">View</a></td></tr>`;
        }).join('') : '<tr><td colspan="5">No applications here yet.</td></tr>';
    }
}
renderDashboard();

// Display a single application, including all recorded decisions.
function renderApplicationDetails() {
    const details = document.getElementById('applicationDetails');
    if (!details) return;
    if (!current) { go('login.html'); return; }
    const db = getDB();
    const id = Number(new URLSearchParams(location.search).get('id'));
    const application = db.applications.find(a => a.id === id);
    if (!application || (current.role === 'student' && application.studentId !== current.id) ||
        (current.role === 'lecturer' && !reviewersForApplication(application).includes(chosenReviewer())) ||
        (current.role !== 'student' && current.role !== 'lecturer' && current.role !== 'admin')) {
        details.textContent = 'Application not found or access denied.';
        return;
    }
    const owner = db.users.find(u => u.id === application.studentId);
    details.innerHTML = `
        <p><b>Application:</b> #${application.id}</p>
        <p><b>Student:</b> ${safe(owner?.name || application.fullName)}</p>
        <p><b>Matriculation number:</b> ${safe(owner?.number || application.matriculationNumber)}</p>
        <p><b>Email:</b> ${safe(owner?.email || application.studentEmail)}</p>
        <p><b>Programme:</b> ${safe(application.program)}</p>
        <p><b>Original course:</b> ${safe(application.originalCourse)}</p>
        <p><b>Institution:</b> ${safe(application.institution)}</p>
        <p><b>Original ECTS:</b> ${safe(application.originalCredits)}</p>
        <p><b>Target course:</b> ${safe(application.targetCourse)}</p>
        <p><b>Target ECTS:</b> ${safe(application.targetCredits)}</p>
        <p><b>Additional details:</b> ${safe(application.description)}</p>
        <p><b>Status:</b> <span class="tag ${statusClass(application.status)}">${safe(application.status)}</span></p>
        <p><b>Lecturer approvals:</b> ${lecturerProgress(application).approved}/${lecturerProgress(application).required.length}</p>
        <p><b>Assigned lecturers:</b> ${lecturerProgress(application).required.map(safe).join(', ')}</p>`;
    // Make each assigned lecturer's decision visible to the student and staff reviewer.
    const reviewerDetails = document.createElement('section');
    reviewerDetails.className = 'review-group';
    reviewerDetails.setAttribute('aria-label', 'Lecturer decisions');
    reviewerDetails.innerHTML = `<h3>Lecturer decisions</h3>${reviewerStatusMarkup(application)}`;
    details.insertAdjacentElement('afterend', reviewerDetails);
    const history = document.getElementById('decisionHistory');
    const decisions = application.decisions || [];
    history.innerHTML = decisions.length ? decisions.map(d => `
        <div class="notice ${d.action === 'Approved' ? 'success' : ''}">
            <b>${safe(d.by)}: ${safe(d.action)}</b>
            <p>${safe(d.comment)}</p><small>${safe(d.date)}</small>
        </div>`).join('') : '<p class="muted">No decisions yet.</p>';
    const panel = document.getElementById('reviewPanel');
    if (panel && current.role === 'lecturer' && canLecturerReview(application)) {
        panel.innerHTML = `<a class="btn" href="lecturer-review.html?id=${id}">Open lecturer review</a>`;
    } else if (panel && current.role === 'admin' && application.status === 'Lecturer approved' && hasAllLecturerApprovals(application)) {
        panel.innerHTML = `<a class="btn" href="exam-board.html?id=${id}">Open examination board</a>`;
    }
}
renderApplicationDetails();
