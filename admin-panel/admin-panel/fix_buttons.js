const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('src/app/components/**/addEdit*.tsx', { cwd: __dirname }).concat(
  ['src/app/components/adminProfile/adminEdit.tsx', 'src/app/components/product/addeditProduct.tsx']
);

files.forEach(f => {
  const filepath = path.join(__dirname, f);
  if (!fs.existsSync(filepath)) return;
  
  let content = fs.readFileSync(filepath, 'utf8');

  // Replace any classes in buttons that dictate size to be exactly `flex-1 px-4 py-2 text-sm font-bold` or similar.
  // Instead of complex regex, let's just forcefully inject 'flex-1 rounded-xl px-4 py-2 text-sm font-bold' 
  // and remove 'px-*', 'py-*', 'text-*', 'w-full', 'sm:w-auto', 'sm:flex-1', 'flex-[2]', 'rounded-*'.

  const lines = content.split('\n');
  let inButton = false;
  
  for(let i=0; i<lines.length; i++) {
    if(lines[i].includes('<button')) inButton = true;
    if(lines[i].includes('</button>')) inButton = false;
    
    if(inButton && lines[i].includes('className=')) {
      // It's a button class definition.
      // If it looks like a form action button (Save, Cancel, Create, Update)
      // Usually they have some recognizable colors.
      let cls = lines[i];
      if (cls.includes('bg-primary') || cls.includes('hover:bg-hover-theme') || cls.includes('text-slate-600') || cls.includes('bg-slate-900') || cls.includes('bg-slate-200')) {
        
        // Remove old sizes and layouts
        cls = cls.replace(/\b(w-full|sm:w-auto|sm:flex-1|flex-1|flex-\[2\]|px-\d+|py-\d+(\.\d+)?|text-(xs|sm|base|lg|xl)|rounded-(lg|xl|2xl|3xl|full)|font-(medium|semibold|black|bold))\b/g, '');
        // Clean up double spaces
        cls = cls.replace(/\s+/g, ' ');
        
        // Add new consistent sizes
        // Every main action button will get `flex-1 rounded-xl px-4 py-2 text-sm font-bold`
        cls = cls.replace('className="', 'className="flex-1 rounded-xl px-4 py-2 text-sm font-bold ');
        
        lines[i] = cls;
      }
    }
  }
  
  fs.writeFileSync(filepath, lines.join('\n'));
});

console.log('Fixed button sizes.');
