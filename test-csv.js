const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const results = [];
const filePath = path.join(__dirname, 'public', 'templates', 'achievements_template.csv');

console.log('Testing CSV Parsing...');

fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
        console.log('Parsed Results:', results);
        if (results.length === 3) {
            console.log('✅ Success: All 3 rows parsed correctly.');
            console.log('First Title:', results[0].title);
        } else {
            console.log('❌ Failure: Expected 3 rows, got ' + results.length);
        }
    });
