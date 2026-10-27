/* CreditBridge language control, shared by all HTML pages. */
(() => {
  'use strict';
  const translations = {
  "Home": "Startseite",
  "How it works": "So funktioniert es",
  "New application": "Neuer Antrag",
  "Login": "Anmelden",
  "Logout": "Abmelden",
  "Register": "Registrieren",
  "← Back to Home": "← Zur Startseite",
  "← Back": "← Zurück",
  "Next →": "Weiter →",
  "Dashboard": "Übersicht",
  "← Back to dashboard": "← Zur Übersicht",
  "CREDIT RECOGNITION · MADE SIMPLE": "ANERKENNUNG VON STUDIENLEISTUNGEN · EINFACH GEMACHT",
  "Your courses.": "Deine Kurse.",
  "Your progress.": "Dein Fortschritt.",
  "Your future.": "Deine Zukunft.",
  "Apply for university credit recognition, get lecturer feedback, and track your application in one simple place.": "Beantrage die Anerkennung deiner Studienleistungen, erhalte Rückmeldungen von Lehrenden und verfolge deinen Antrag an einem Ort.",
  "Get started →": "Jetzt starten →",
  "PROCESS": "ABLAUF",
  "How CreditBridge works.": "So funktioniert CreditBridge.",
  "1. Student application": "1. Antrag stellen",
  "Register, sign in, and submit your course recognition information.": "Melde dich an und reiche die Angaben zur Anerkennung deiner Kurse ein.",
  "2. Lecturer review": "2. Prüfung durch Lehrende",
  "The lecturer approves or rejects the academic request.": "Die Lehrperson stimmt dem Antrag zu oder lehnt ihn ab.",
  "3. Final decision": "3. Endgültige Entscheidung",
  "The study center confirms the request, and the student can track the result.": "Die zuständige Stelle bestätigt den Antrag. Studierende können den Status verfolgen.",
  "Student login": "Studierenden-Login",
  "NEW APPLICATION · STEP 1 OF 8": "NEUER ANTRAG · SCHRITT 1 VON 8",
  "NEW APPLICATION · STEP 2 OF 8": "NEUER ANTRAG · SCHRITT 2 VON 8",
  "NEW APPLICATION · STEP 3 OF 8": "NEUER ANTRAG · SCHRITT 3 VON 8",
  "NEW APPLICATION · STEP 4 OF 8": "NEUER ANTRAG · SCHRITT 4 VON 8",
  "NEW APPLICATION · STEP 5 OF 8": "NEUER ANTRAG · SCHRITT 5 VON 8",
  "NEW APPLICATION · STEP 6 OF 8": "NEUER ANTRAG · SCHRITT 6 VON 8",
  "NEW APPLICATION · STEP 7 OF 8": "NEUER ANTRAG · SCHRITT 7 VON 8",
  "NEW APPLICATION · STEP 8 OF 8": "NEUER ANTRAG · SCHRITT 8 VON 8",
  "Select your university": "Hochschule auswählen",
  "Where did you complete your previous exam or course?": "An welcher Hochschule hast du die Prüfung oder den Kurs abgeschlossen?",
  "Name of the University where the exam was acquired": "Name der Hochschule, an der die Prüfung abgelegt wurde",
  "Choose a suggestion or enter any other university. THD reviews credits individually.": "Wähle einen Vorschlag oder gib eine andere Hochschule ein. Die THD prüft Studienleistungen einzeln.",
  "Please select your program": "Bitte wähle deinen Studiengang",
  "Choose your programme at THD's European Campus Rottal-Inn.": "Wähle deinen Studiengang am European Campus Rottal-Inn der THD.",
  "Industrial Engineering": "Wirtschaftsingenieurwesen",
  "Energy Systems Engineering": "Energiesystemtechnik",
  "Module name from earlier studies": "Modulname aus früherem Studium",
  "Enter the name of the module you completed abroad or during earlier studies. Provide at least one language.": "Gib den Namen des früher absolvierten Moduls an. Mindestens eine Sprache ist erforderlich.",
  "German": "Deutsch",
  "English": "Englisch",
  "Semester of completed examination": "Semester der abgelegten Prüfung",
  "Select semester (optional)": "Semester wählen (optional)",
  "Winter semester": "Wintersemester",
  "Summer semester": "Sommersemester",
  "Year": "Jahr",
  "Performance in earlier studies": "Leistungen aus früherem Studium",
  "The performance abroad or in earlier studies was evaluated as follows:": "Die Leistung im Ausland oder im früheren Studium wurde wie folgt bewertet:",
  "SWS (semester hours per week)": "SWS (Semesterwochenstunden)",
  "If known. SWS = Semesterwochenstunden.": "Falls bekannt. SWS = Semesterwochenstunden.",
  "ECTS credits": "ECTS-Leistungspunkte",
  "ECTS = European Credit Transfer and Accumulation System.": "ECTS = Europäisches System zur Übertragung und Akkumulierung von Studienleistungen.",
  "Supporting documents": "Nachweise",
  "Recognition is not possible without supporting documents. Select the documents you can provide.": "Ohne Nachweise ist keine Anerkennung möglich. Wähle die vorhandenen Unterlagen aus.",
  "Copy of certificate of performance (grade sheet)": "Kopie des Leistungsnachweises (Notenübersicht)",
  "Annotated module catalogue": "Kommentiertes Modulhandbuch",
  "Contact info of person(s) responsible for the module and a link to the course description": "Kontaktdaten der Modulverantwortlichen und Link zur Kursbeschreibung",
  "Others": "Sonstige",
  "Module contact and course-description link (if applicable)": "Modulkontakt und Link zur Kursbeschreibung (falls vorhanden)",
  "Other supporting documents": "Weitere Nachweise",
  "Upload supporting documents": "Nachweise hochladen",
  "Accepted types: PDF, JPG, PNG, DOC, or DOCX.": "Erlaubte Formate: PDF, JPG, PNG, DOC oder DOCX.",
  "1. Certificate of performance / Grade sheet": "1. Leistungsnachweis / Notenübersicht",
  "Choose one or more grade sheets.": "Wähle einen oder mehrere Leistungsnachweise aus.",
  "2. Annotated module catalogue": "2. Kommentiertes Modulhandbuch",
  "3. Module contact / Course description": "3. Modulkontakt / Kursbeschreibung",
  "4. Other supporting documents": "4. Weitere Nachweise",
  "Clear selected files": "Ausgewählte Dateien entfernen",
  "Clear selected file": "Ausgewählte Datei entfernen",
  "No file selected": "Keine Datei ausgewählt",
  "Module recognition at THD": "Modulanerkennung an der THD",
  "The above-mentioned module will be recognized as (name of the module at the DIT):": "Das oben genannte Modul soll als folgendes THD-Modul anerkannt werden:",
  "Select THD module": "THD-Modul auswählen",
  "Search THD modules": "THD-Module suchen",
  "Select a module": "Modul auswählen",
  "Compulsory module": "Pflichtmodul",
  "AWP-Course (Compulsory elective subject of a general academic nature)": "AWP-Fach (Allgemeinwissenschaftliches Wahlpflichtfach)",
  "FWP-Course (Course-related elective subject)": "FWP-Fach (Fachbezogenes Wahlpflichtfach)",
  "Elective module": "Wahlmodul",
  "Save course and review →": "Kurs speichern und prüfen →",
  "Review your application draft": "Antragsentwurf prüfen",
  "Student information": "Angaben zur Person",
  "Full name": "Vollständiger Name",
  "Matriculation number": "Matrikelnummer",
  "Email": "E-Mail",
  "Previous university and studies": "Frühere Hochschule und Studium",
  "University where the exam was acquired": "Hochschule der früheren Prüfung",
  "Module name (German)": "Modulname (Deutsch)",
  "Module name (English)": "Modulname (Englisch)",
  "SWS": "SWS",
  "ECTS": "ECTS",
  "Supporting document categories": "Arten der Nachweise",
  "Module contact and course-description link": "Modulkontakt und Kursbeschreibungslink",
  "Other documents": "Sonstige Unterlagen",
  "Selected document files": "Ausgewählte Dateien",
  "Requested THD recognition": "Beantragte Anerkennung an der THD",
  "THD module": "THD-Modul",
  "Date and student signature": "Datum und Unterschrift der studierenden Person",
  "Student signature (JPG, PNG or PDF)": "Unterschrift (JPG, PNG oder PDF)",
  "Submit": "Absenden",
  "APPLICATION COMPLETE": "ANTRAG ABGESCHLOSSEN",
  "Application submitted": "Antrag eingereicht",
  "Your application was added to your CreditBridge dashboard.": "Dein Antrag wurde deiner CreditBridge-Übersicht hinzugefügt.",
  "Application number:": "Antragsnummer:",
  "Go to Dashboard →": "Zur Übersicht →",
  "Application details": "Antragsdetails",
  "Course information": "Kursinformationen",
  "Review timeline": "Bearbeitungsverlauf",
  "STUDENT PORTAL": "STUDIERENDENPORTAL",
  "Student Dashboard": "Studierendenübersicht",
  "My applications": "Meine Anträge",
  "+ New application": "+ Neuer Antrag",
  "EXAMINATION BOARD PORTAL": "PRÜFUNGSAUSSCHUSS",
  "Applications for final confirmation": "Anträge zur abschließenden Bestätigung",
  "EXAMINATION BOARD": "PRÜFUNGSAUSSCHUSS",
  "Examination board confirmation": "Bestätigung durch den Prüfungsausschuss",
  "Signature of the chairman of the examination board": "Unterschrift des Vorsitzes des Prüfungsausschusses",
  "Save confirmation": "Bestätigung speichern",
  "LECTURER PORTAL": "LEHRENDENPORTAL",
  "Lecturer applications": "Anträge für Lehrende",
  "LECTURER REVIEW": "PRÜFUNG DURCH LEHRENDE",
  "Recognition decision": "Anerkennungsentscheidung",
  "Recognized with the grade:": "Anerkannt mit der Note:",
  "Not recognized. Reason:": "Nicht anerkannt. Begründung:",
  "The documents have been checked for completeness by the lecturer.": "Die Unterlagen wurden von der Lehrperson auf Vollständigkeit geprüft.",
  "Signature of the lecturer": "Unterschrift der Lehrperson",
  "Save decision": "Entscheidung speichern",
  "Student dashboard": "Studierendenübersicht",
  "Employee dashboard": "Mitarbeitendenübersicht",
  "Print / Save as PDF": "Drucken / Als PDF speichern",
  "Loading application...": "Antrag wird geladen ...",
  "Date": "Datum",
  "ID": "ID",
  "Original course": "Früherer Kurs",
  "Target course": "Zielmodul",
  "Status": "Status",
  "Action": "Aktion",
  "THD study program": "THD-Studiengang",
  "Module type": "Modultyp",
  "Back": "Zurück",
  "Select an application from the dashboard.": "Wähle einen Antrag aus der Übersicht.",
  "Continue as ...": "Weiter als ...",
  "Student": "Studierende",
  "Employee": "Mitarbeitende",
  "← Choose another role": "← Andere Rolle wählen",
  "STUDENT ACCESS": "ZUGANG FÜR STUDIERENDE",
  "EMPLOYEE ACCESS": "ZUGANG FÜR MITARBEITENDE",
  "Sign in": "Anmelden",
  "Email or Username": "E-Mail oder Benutzername",
  "Password": "Passwort",
  "Login →": "Anmelden →"
};
  const englishNodes = new WeakMap();
  const englishAttributes = new WeakMap();
  const ignoredTags = new Set(['SCRIPT','STYLE','CODE','PRE','TEXTAREA']);
  let language = localStorage.getItem('creditbridge_language') === 'de' ? 'de' : 'en';
  let applying = false;
  const normalize = text => text.replace(/\s+/g,' ').trim();
  const translate = text => translations[normalize(text)] || text;
  const preserveSpacing = (text, replacement) => {
    const left = (text.match(/^\s*/) || [''])[0];
    const right = (text.match(/\s*$/) || [''])[0];
    return left + replacement + right;
  };
  function update(root=document.body) {
    if (!root || applying) return;
    applying = true;
    try {
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      let node;
      while ((node=walker.nextNode())) {
        const parent=node.parentElement;
        if (!parent || ignoredTags.has(parent.tagName) || parent.closest('[data-no-translate],.cb-language-switch')) continue;
        const value=node.nodeValue;
        if (!normalize(value)) continue;
        let original=englishNodes.get(node);
        if (original === undefined) { original=value; englishNodes.set(node,value); }
        const desired=language==='de' ? preserveSpacing(original,translate(original)) : original;
        if (node.nodeValue!==desired) node.nodeValue=desired;
      }
      const elements = [root, ...root.querySelectorAll('*')].filter(el=>el?.getAttribute);
      for (const el of elements) {
        if (el.closest('[data-no-translate],.cb-language-switch')) continue;
        for (const attribute of ['placeholder','title','aria-label']) {
          if (!el.hasAttribute(attribute)) continue;
          let originals=englishAttributes.get(el);
          if (!originals){originals={};englishAttributes.set(el,originals);}
          if (!(attribute in originals)) originals[attribute]=el.getAttribute(attribute);
          const source=originals[attribute];
          const desired=language==='de' ? translate(source) : source;
          if (el.getAttribute(attribute)!==desired) el.setAttribute(attribute,desired);
        }
      }
    } finally { applying=false; }
  }
  function refreshButtons(){
    document.documentElement.lang=language;
    document.querySelectorAll('.cb-language-switch button').forEach(button=>{
      const active=button.dataset.lang===language;
      button.setAttribute('aria-pressed',String(active));
      button.classList.toggle('selected',active);
    });
  }
  function setLanguage(next){
    language=next==='de'?'de':'en';
    localStorage.setItem('creditbridge_language',language);
    update();refreshButtons();
  }
  function init(){
    let nav=document.querySelector('header .nav, header nav, nav.nav');
    if(!nav) nav=document.querySelector('header');
    if(nav && !nav.querySelector('.cb-language-switch')) {
      const switcher=document.createElement('div');
      switcher.className='cb-language-switch';
      switcher.setAttribute('role','group');
      switcher.setAttribute('aria-label','Language / Sprache');
      switcher.innerHTML='<button type="button" data-lang="en" aria-label="English">EN</button><span aria-hidden="true">/</span><button type="button" data-lang="de" aria-label="Deutsch">DE</button>';
      nav.appendChild(switcher);
      switcher.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang)));
    }
    update();refreshButtons();
    const observer=new MutationObserver(records=>{
      if(applying) return;
      if(records.some(r=>r.addedNodes.length)) update();
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();