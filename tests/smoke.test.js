const fs = require('fs');
const path = require('path');

const mustExist = [
  'backend/src/server.js',
  'backend/src/models/User.js',
  'backend/src/routes/adminRoutes.js',
  'frontend/pages/dashboard.ejs',
  'frontend/public/css/styles.css'
];

let failed = false;
for (const file of mustExist) {
  const p = path.join(process.cwd(), file);
  if (!fs.existsSync(p)) {
    console.error(`Missing ${file}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('Smoke test passed');
