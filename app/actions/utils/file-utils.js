const fs = require('fs');
const path = require('path');

export default function searchDir(dir, filter) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const dirPath = `${dir}/${file}`;
    const stat = fs.statSync(dirPath);
    if (stat && stat.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(searchDir(dirPath, filter));
    } else {
      const absPath = path.resolve(dirPath);
      if (filter && filter(absPath)) {
        results.push(absPath);
      }
    }
  });
  return results;
}
