import fs from 'fs';

const filePath = '/Users/megumuueda/Documents/GitHub/sayin5min/src/assets/Story.ja.json';

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  try {
    JSON.parse(data);
    console.log('JSON is valid.');
  } catch (error) {
    console.error('Error parsing JSON:', error.message);
    // Attempt to fix the JSON
    const fixedData = data.replace(/,s*}/g, '}').replace(/,s*]/g, ']');
    try {
      JSON.parse(fixedData);
      console.log('JSON fixed and is now valid.');
      fs.writeFile(filePath, fixedData, 'utf8', (err) => {
        if (err) {
          console.error('Error writing fixed file:', err);
        } else {
          console.log('Fixed JSON saved successfully.');
        }
      });
    } catch (e) {
      console.error('Failed to fix JSON:', e.message);
    }
  }
});