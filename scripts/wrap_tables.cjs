const fs = require('fs');
const path = require('path');

const dir = 'c:\\transhubcars\\admin\\components';
const files = fs.readdirSync(dir).filter(x => x.endsWith('.tsx'));
files.push('../AdminDashboard.tsx');

let count = 0;

for (const x of files) {
  const fp = path.join(dir, x);
  let txt = fs.readFileSync(fp, 'utf8');
  if (!txt.includes('responsive-table-wrapper') && txt.includes('<table')) {
    txt = txt.replace(/(<table[^>]*>)/g, '<div className="responsive-table-wrapper" style={{width: "100%"}}>\n$1');
    txt = txt.replace(/<\/table>/g, '</table>\n</div>');
    fs.writeFileSync(fp, txt, 'utf8');
    count++;
  }
}
console.log('Wrapped tables in ' + count + ' files.');
