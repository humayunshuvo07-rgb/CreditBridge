
CreditBridge
University Course Recognition Management System
A responsive, multilingual frontend for managing academic credit-recognition requests at Deggendorf Institute of Technology (THD).

Overview
CreditBridge provides a guided application process for students who want courses completed at another institution to be considered for recognition toward their THD degree. It also includes separate interfaces for lecturer reviews and examination-board decisions.

Project status: Frontend prototype / demonstration. The current repository uses HTML, CSS, and vanilla JavaScript. It does not include a production backend, database, secure authentication service, or permanent server-side file storage.

Key features
Role-based interfaces: Student, Lecturer, and Examination Board.
Guided student workflow: University selection, degree program, previous course, workload/credits, supporting documents, THD target module, review, signature, and submission.
Degree programs: Industrial Engineering (IE) and Energy Systems Engineering (ESE).
Module assistance: Course suggestions, German/English module-name matching, and editable SWS/ECTS values where reference data is available.
Supporting documents: Separate steps for a grade sheet, annotated module catalogue, responsible-person/course-description information, and other documents.
Review workflow: Lecturer review and examination-board decision screens; the prototype contains logic for modules assigned to multiple lecturers.
Student dashboard: Application overview, status display, and context-sensitive help for table columns.
Bilingual interface: English/German (EN/DE) language controls.
Responsive layout: Designed for desktop and mobile/tablet browsers.
Important: Prototype features are demonstrated within the browser. A visible status or approval is not an official THD decision.

Technology stack
Layer	Technology
User interface	HTML5, CSS3
Client-side logic	Vanilla JavaScript
Demo data	Browser localStorage and sessionStorage
Deployment	Static hosting, such as Netlify
Backend/API	Not yet implemented
No Node.js build process or third-party package installation is required to view the frontend.

Getting started
Download and extract the project ZIP.
Open the CreditBridge1 directory.
Open index.html in a modern browser, or serve the directory through a local static server.
Use Login to enter the student or employee demonstration interface.
For more reliable browser behavior, use a local HTTP server instead of opening pages via file://:

cd CreditBridge1
python -m http.server 8000
Visit http://localhost:8000/.

Demo credentials
These credentials exist only for local/prototype testing and must not be reused in production.

Role	Login	Password
Student	shuvo07	12345678
Lecturer	lecturer@demo.test	123
Examination Board	admin@demo.test	123
The employee roles use the Employee login option. Credentials are defined in the frontend source, so they provide no meaningful security.

Student application process
Login: Access the student dashboard.
Select university: Search the list or enter the institution manually.
Choose program: Select Industrial Engineering or Energy Systems Engineering.
Describe previous course: Enter the original module name and relevant details; suggestions are available for known modules.
Enter academic performance: Review or enter SWS (Semesterwochenstunden, weekly teaching hours during the semester) and ECTS (European Credit Transfer and Accumulation System credits).
Attach supporting documents: Provide the applicable certificate, module catalogue, course-description/contact evidence, or other documents.
Select THD target module: Identify the module for which recognition is requested.
Review and sign: Check application details and provide the requested date/signature information.
Submit: View the resulting application status in the demo interface.
Some recognition applications may involve several modules and more than one reviewing lecturer.

Project structure
CreditBridge1/
├── index.html                    # Landing page
├── login.html                    # Student and employee login
├── student-dashboard.html        # Student application overview
├── apply.html                    # Previous university selection
├── program.html                  # THD degree program selection
├── module.html                   # Previous course information
├── performance.html              # Workload and credits
├── documents.html                # Grade sheet evidence
├── document-catalogue.html       # Annotated module catalogue
├── document-course.html          # Course description / contact evidence
├── document-other.html           # Other supporting documents
├── target-module.html            # THD target course selection
├── review.html                   # Student application review
├── signature.html                # Student signature step
├── submitted.html                # Submission confirmation
├── lecturer-dashboard.html       # Lecturer queue
├── lecturer-review.html          # Lecturer decision interface
├── exam-board-dashboard.html     # Examination board queue
├── exam-board.html               # Examination board decision
├── print-application.html        # Print-friendly application
├── how-it-works.html             # Workflow guidance
├── integration-contract.json     # Draft API/data contract
├── css/                          # Stylesheets
└── js/                           # Frontend behavior and demo data
Additional HTML files support application details and navigation compatibility.

Data and storage
The prototype uses browser storage rather than a database:

localStorage retains demo users, draft/application data, and certain UI selections in the same browser profile.
sessionStorage supports the current login session.
Clearing site data, using another browser/device, or changing the browser profile may make demo information unavailable.
Selecting a file in the browser does not mean it has been uploaded to a server. Real upload, retrieval, validation, and long-term storage require backend implementation.
Do not enter real student records, passwords, signatures, or confidential academic documents into a publicly hosted prototype.

Proposed backend integration
The included `integration-contract.json` is a draft, not an implemented service contract. It outlines application, module-review, document, signature, and decision data along with possible endpoints:

Proposed operation	Purpose
POST /api/applications	Submit an application
GET /api/applications/{id}	Retrieve an application
PUT /api/drafts/{id}	Save a draft
POST /api/files	Upload supporting files
POST /api/modules/{id}/reviews	Record a lecturer review
POST /api/applications/{id}/board-decision	Record the board's decision
Before production use, the frontend and backend teams need to agree on the API schema, validation rules, status transitions, lecturer assignments, and error handling.

Production requirements
Server-side authentication and role-based authorization.
A database for users, applications, modules, reviews, and audit history.
Secure document storage and virus/type/size checks for uploads.
Server-side enforcement of the required reviewer decisions.
Secure signatures and documented approval responsibilities.
Data protection controls, retention/deletion policies, and HTTPS.
Automated tests for submission, Back/Next navigation, validation, and permission boundaries.
Deploying to Netlify
CreditBridge can be deployed as a static site:

Extract the ZIP archive.
In Netlify, start a manual deployment or connect the repository.
Set the publish directory to the folder containing index.html (the contents of CreditBridge1, not a parent folder without index.html).
Deploy and verify student and employee pages, language switching, and navigation.
After publishing updates, perform a hard refresh if the browser displays older assets.
Netlify static hosting alone does not provide the planned backend or persistent shared application database.

Current limitations
Demo login credentials and role management are client-side only.
Browser storage is local to a device/browser and is not multiuser synchronization.
File selection is not durable server-side uploading.
The API contract is provisional and must be aligned with the backend developer.
The interface and sample academic-module mappings should be validated against the current official THD requirements before institutional deployment.
Development guidance
Keep shared styles in css/ and scripts in js/.
Edit the relevant .html page for page-specific content and markup.
When changing page order or navigation, test both Next and Back, including returning to partially filled forms.
Test both EN and DE views, all three roles, and small screens after updates.
Do not treat frontend-only permission checks as a security boundary.
Project purpose
CreditBridge is developed as an academic web application concept to make course recognition easier to submit, review, and track. Its current deliverable is an interactive frontend that can serve as the basis for a future full-stack system.

Disclaimer: This is a project prototype, not an official THD recognition portal or a guarantee of credit recognition.

