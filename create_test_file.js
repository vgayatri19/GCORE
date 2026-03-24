const fs = require('fs');

// We don't have a simple PDF generator installed to create a raw test file from string easily without breaking formatting dependencies, 
// so I'm creating a basic text file disguised as a docx to test the upload route handling, since mammoth handles buffer parsing.
fs.writeFileSync('test_resume.docx', 'Experienced software engineer using Java, Python, and AWS. I have teamwork and communication skills. Managed a project.');
