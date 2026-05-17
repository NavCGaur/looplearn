const fs = require('fs');
const path = 'docs/SCIENCE_QUESTIONS.json';
let content = fs.readFileSync(path, 'utf8');

// Replace subject
content = content.replace(/\"subject\": \"physics\"/g, '\"subject\": \"science\"');

// Replace class_standard
content = content.replace(/\"class_standard\": 9/g, '\"class_standard\": 8');

fs.writeFileSync(path, content);
console.log('Update complete.');
