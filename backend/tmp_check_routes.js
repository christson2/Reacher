const path = require('path');
const routesDir = path.join(__dirname, 'src', 'routes');
const fs = require('fs');

const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
for (const f of files) {
  try {
    const mod = require(path.join(routesDir, f));
    console.log(f, '->', typeof mod, Object.keys(mod).length ? Object.keys(mod) : Object.keys(mod));
    if (mod && mod.stack) console.log(f, 'has stack length', mod.stack.length);
  } catch (err) {
    console.error('ERROR requiring', f, err && err.message);
  }
}
