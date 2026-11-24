"use strict";
// The programme-specific names below come from the IE and ESE module catalogues.
const CREDITBRIDGE_MODULE_NAMES = {"Industrial Engineering":["Analytical Principles of Engineering","Informatics for Engineering I","Chemistry (lecture)","Lab Work in Chemistry","Principles in Business and Economics","Basics – Scientific Writing","Scientific Writing, Research Methods and Project Management","Accounting","Foreign Language I","Mathematics for Engineering","Informatics for Engineering II","Technical Mechanics I","Physics","Lab Work in Physics","Compulsory elective subject of a general academic nature (AWP) I","Foreign Language II","Applied Mathematics","Fundamentals of Electrical Engineering","Intercultural Management","Sustainability","Business Law","Foreign Language III","Financing","Logistics and Operations Research","Technical Mechanics II","Energy Technology","Fundamentals of Measurement and Control Engineering","Foreign Language IV","Compulsory elective subject of a general academic nature (AWP) II","Process Safety","Applied Measurement and Control Engineering","Plant Engineering","Management","Renewable Energies","Project Work","Internship including PLV 1 and PLV 2","Bachelor Thesis","Applied Communication Techniques","Business Planning and Start-Up Management","Data Acquisition and Processing","Energy and Resource Efficiency","Energy Markets","Globalisation","Industrial Automation and Information Technology","Insights into the Corporate World","Modelling Theory","Operational Processes","Process Engineering","Process Optimization"],"Energy Systems Engineering":["Analytical Principles of Engineering","Informatics for Engineering I","Fundamentals of Electrical Engineering","Physics","Chemistry","Foreign Language I","Mathematics for Engineering","Informatics for Engineering II","Electrical and Power Engineering","Lab work in Natural Sciences","Materials and Design","Intercultural competences","Compulsory elective subject of a general academic nature (AWP) I","Foreign Language II","Applied Mathematics","Energy Technology","Measurement and Control Engineering","Fundamentals of Energy Economy","Project Work I incl. Scientific Writing","Foreign Language III","Project Work II incl. Simulation and Design","Renewable Energies","Sustainability","Plant Engineering","Compulsory elective subject of a general academic nature (AWP) II","Compulsory Elective I*","Foreign Language IV","Internship including PLV seminars","Power Grid Technologies","Energy Storage","Smart Systems and Technologies","Compulsory Elective II*","Project Work III incl. Lab Work in Energy Systems","Grid Management","Site Planning and GIS","Compulsory Elective III*","Bachelor thesis","Process Engineering","Advanced Fluid and Energy Technology","Principles of Energy Systems Management","Operational Processes","Computer Simulation in Energy and Resource Economics","Energy Economics Policy","International Energy Regulations","Health Safety Environment","Technology and Intellectual Property Rights Management","MRO-Strategies and Process Reliability","Entrepreneurship","Strategic Planning and Project Management","Finance and Accounting","Safety and Security in Energy Systems","Energy and Ressource Efficiency","Process Optimization","Modelling Theory"]};


// Corresponding German names for the programmes' English module titles.
// A translation is filled only for a recognized title, never for unknown manual text.
const MODULE_TRANSLATIONS = {
    'Analytical Principles of Engineering':'Analytische Grundlagen der Ingenieurwissenschaften',
    'Informatics for Engineering I':'Informatik für Ingenieure I',
    'Informatics for Engineering II':'Informatik für Ingenieure II',
    'Chemistry':'Chemie',
    'Principles in Business and Economics':'Grundlagen der Betriebs- und Volkswirtschaftslehre',
    'Scientific Writing, Research Methods and Project Management':'Wissenschaftliches Arbeiten, Forschungsmethoden und Projektmanagement',
    'Accounting':'Rechnungswesen',
    'Foreign Language I':'Fremdsprache I',
    'Foreign Language II':'Fremdsprache II',
    'Foreign Language III':'Fremdsprache III',
    'Foreign Language IV':'Fremdsprache IV',
    'Mathematics for Engineering':'Mathematik für Ingenieure',
    'Technical Mechanics I':'Technische Mechanik I',
    'Technical Mechanics II':'Technische Mechanik II',
    'Physics':'Physik',
    'Lab Work in Physics':'Physikpraktikum',
    'Chemistry (lecture)':'Chemie (Vorlesung)',
    'Lab Work in Chemistry':'Chemiepraktikum',
    'Basics – Scientific Writing':'Grundlagen des wissenschaftlichen Arbeitens',
    'Bachelor Thesis':'Bachelorarbeit',
    'Applied Communication Techniques':'Angewandte Kommunikationstechniken',
    'Compulsory elective subject of a general academic nature (AWP) I':'Allgemeinwissenschaftliches Pflichtwahlfach (AWP) I',
    'Compulsory elective subject of a general academic nature (AWP) II':'Allgemeinwissenschaftliches Pflichtwahlfach (AWP) II',
    'Applied Mathematics':'Angewandte Mathematik',
    'Fundamentals of Electrical Engineering':'Grundlagen der Elektrotechnik',
    'Intercultural Management':'Interkulturelles Management',
    'Intercultural competences':'Interkulturelle Kompetenzen',
    'Sustainability':'Nachhaltigkeit',
    'Business Law':'Wirtschaftsrecht',
    'Financing':'Finanzierung',
    'Logistics and Operations Research':'Logistik und Operations Research',
    'Energy Technology':'Energietechnik',
    'Fundamentals of Measurement and Control Engineering':'Grundlagen der Mess- und Regelungstechnik',
    'Process Safety':'Prozesssicherheit',
    'Applied Measurement and Control Engineering':'Angewandte Mess- und Regelungstechnik',
    'Plant Engineering':'Anlagentechnik',
    'Management':'Management',
    'Renewable Energies':'Erneuerbare Energien',
    'Project Work':'Projektarbeit',
    'Internship including PLV 1 and PLV 2':'Praktikum einschließlich PLV 1 und PLV 2',
    'Bachelor Module':'Bachelormodul',
    'Business Planning and Start-Up Management':'Unternehmensplanung und Gründungsmanagement',
    'Data Acquisition and Processing':'Datenerfassung und -verarbeitung',
    'Energy and Resource Efficiency':'Energie- und Ressourceneffizienz',
    'Energy and Ressource Efficiency':'Energie- und Ressourceneffizienz',
    'Energy Markets':'Energiemärkte',
    'Globalisation':'Globalisierung',
    'Industrial Automation and Information Technology':'Industrielle Automatisierungs- und Informationstechnik',
    'Insights into the Corporate World':'Einblicke in die Unternehmenswelt',
    'Modelling Theory':'Modellierungstheorie',
    'Operational Processes':'Betriebliche Prozesse',
    'Process Engineering':'Verfahrenstechnik',
    'Process Optimization':'Prozessoptimierung',
    'Electrical and Power Engineering':'Elektrotechnik und elektrische Energietechnik',
    'Lab work in Natural Sciences':'Naturwissenschaftliches Praktikum',
    'Materials and Design':'Werkstoffe und Konstruktion',
    'Measurement and Control Engineering':'Mess- und Regelungstechnik',
    'Fundamentals of Energy Economy':'Grundlagen der Energiewirtschaft',
    'Project Work I incl. Scientific Writing':'Projektarbeit I einschließlich wissenschaftlichem Arbeiten',
    'Project Work II incl. Simulation and Design':'Projektarbeit II einschließlich Simulation und Konstruktion',
    'Compulsory Elective I*':'Pflichtwahlfach I',
    'Compulsory Elective II*':'Pflichtwahlfach II',
    'Compulsory Elective III*':'Pflichtwahlfach III',
    'Internship including PLV seminars':'Praktikum einschließlich PLV-Seminaren',
    'Power Grid Technologies':'Stromnetztechnologien',
    'Energy Storage':'Energiespeicherung',
    'Smart Systems and Technologies':'Intelligente Systeme und Technologien',
    'Project Work III incl. Lab Work in Energy Systems':'Projektarbeit III einschließlich Energietechnikpraktikum',
    'Grid Management':'Netzmanagement',
    'Site Planning and GIS':'Standortplanung und Geoinformationssysteme',
    'Bachelor thesis':'Bachelorarbeit',
    'Advanced Fluid and Energy Technology':'Vertiefte Strömungs- und Energietechnik',
    'Principles of Energy Systems Management':'Grundlagen des Energiesystemmanagements',
    'Computer Simulation in Energy and Resource Economics':'Computersimulation in der Energie- und Ressourcenökonomie',
    'Energy Economics Policy':'Energiepolitik',
    'International Energy Regulations':'Internationale Energieregulierung',
    'Health Safety Environment':'Gesundheit, Sicherheit und Umwelt',
    'Technology and Intellectual Property Rights Management':'Technologie- und Schutzrechtsmanagement',
    'MRO-Strategies and Process Reliability':'Instandhaltungsstrategien und Prozesszuverlässigkeit',
    'Entrepreneurship':'Unternehmertum',
    'Strategic Planning and Project Management':'Strategische Planung und Projektmanagement',
    'Finance and Accounting':'Finanzen und Rechnungswesen',
    'Safety and Security in Energy Systems':'Sicherheit in Energiesystemen'
};

(() => {
    const german = document.getElementById('moduleGerman');
    const english = document.getElementById('moduleEnglish');
    if (!german || !english) return;

    const active = typeof user === 'function' ? user() : null;
    let programme = '';
    try {
        const draft = JSON.parse(localStorage.getItem('creditbridge_application_draft_' + active?.id) || '{}');
        programme = draft.program || '';
    } catch (_) {}
    const names = CREDITBRIDGE_MODULE_NAMES[programme] || [];
    const pairs = names.map(en => ({en, de: MODULE_TRANSLATIONS[en] || ''}));
    const normalize = text => String(text).trim().toLocaleLowerCase('de-DE');
    let syncing = false;

    // Exact match translates the other field. A manual title never gets an invented translation.
    function syncFrom(input) {
        if (syncing) return;
        const isEnglish = input === english;
        const target = isEnglish ? german : english;
        const match = pairs.find(pair => normalize(isEnglish ? pair.en : pair.de) === normalize(input.value));
        if (!match || !match.de) return;
        syncing = true;
        target.value = isEnglish ? match.de : match.en;
        target.dispatchEvent(new Event('change', {bubbles:true}));
        syncing = false;
    }

    [german, english].forEach(input => {
        const isEnglish = input === english;
        const wrapper = document.createElement('div');
        wrapper.className = 'cb-subject-picker';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        const panel = document.createElement('div');
        panel.className = 'cb-subject-options';
        panel.setAttribute('role', 'listbox');
        panel.hidden = true;
        panel.id = input.id + '-suggestions';
        input.setAttribute('aria-controls', panel.id);
        wrapper.appendChild(panel);
        function close() {panel.hidden = true; input.setAttribute('aria-expanded','false');}
        function show() {
            panel.replaceChildren();
            if (!pairs.length) return close();
            const typed = normalize(input.value);
            const matches = pairs.filter(pair => normalize(isEnglish ? pair.en : pair.de).includes(typed)).slice(0,12);
            if (!matches.length) return close();
            matches.forEach(pair => {
                const option = document.createElement('button');
                option.type = 'button';
                option.className = 'cb-subject-option';
                option.setAttribute('role','option');
                option.textContent = isEnglish ? pair.en : pair.de;
                option.addEventListener('mousedown', e => e.preventDefault());
                option.addEventListener('click', () => {
                    input.value = isEnglish ? pair.en : pair.de;
                    syncFrom(input);
                    close();
                    input.focus();
                });
                panel.appendChild(option);
            });
            panel.hidden = false;
            input.setAttribute('aria-expanded','true');
        }
        input.addEventListener('focus', show);
        input.addEventListener('click', show);
        input.addEventListener('input', () => {syncFrom(input); show();});
        input.addEventListener('change', () => syncFrom(input));
        input.addEventListener('keydown', event => {
            if(event.key === 'Escape') close();
            if(event.key === 'ArrowDown' && !panel.hidden) {
                event.preventDefault();
                panel.querySelector('button')?.focus();
            }
        });
        panel.addEventListener('keydown', event => {
            if (event.key === 'Escape') {close();input.focus();}
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                const buttons = Array.from(panel.querySelectorAll('button'));
                const i = buttons.indexOf(document.activeElement);
                const next = buttons[i + (event.key === 'ArrowDown' ? 1 : -1)];
                if (next) {event.preventDefault();next.focus();}
            }
        });
        input.addEventListener('blur', () => setTimeout(() => {if (!wrapper.contains(document.activeElement)) close();},100));
        document.addEventListener('pointerdown', e => {if (!wrapper.contains(e.target)) close();});
    });
})();
