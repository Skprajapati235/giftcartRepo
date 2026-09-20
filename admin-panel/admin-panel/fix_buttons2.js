const fs = require('fs');
const path = require('path');

const files = [
  'src/app/components/category/addEditCategory.tsx',
  'src/app/components/city/addEditCity.tsx',
  'src/app/components/occasions/addEditOccasion.tsx',
  'src/app/components/flavors/addEditFlavor.tsx'
];

files.forEach(f => {
  const filepath = path.join(__dirname, f);
  if (!fs.existsSync(filepath)) return;
  
  let content = fs.readFileSync(filepath, 'utf8');

  // Cancel Button
  content = content.replace(
    /className="w-full sm:w-auto border border-border-theme text-slate-700 rounded-xl px-4 py-2 text-sm font-bold hover:bg-hover-theme transition"/g,
    'className="w-full sm:w-32 border border-border-theme text-slate-700 rounded-xl px-4 py-2 text-sm font-bold hover:bg-hover-theme transition text-center"'
  );
  
  // Submit Button
  content = content.replace(
    /className="w-full sm:flex-1 bg-primary text-white rounded-xl py-2 text-sm font-bold hover:opacity-90 transition shadow-lg shadow-primary\/20 disabled:opacity-50"/g,
    'className="w-full sm:w-32 bg-primary text-white rounded-xl px-4 py-2 text-sm font-bold hover:opacity-90 transition shadow-lg shadow-primary/20 disabled:opacity-50 text-center"'
  );

  // Change container from items-center gap-4 to justify-end gap-3
  content = content.replace(
    /className="pt-4 flex flex-col sm:flex-row items-center gap-4(.*)"/g,
    'className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3$1"'
  );

  // Shorten submit text so it fits 32
  content = content.replace(/\? "Update [a-zA-Z]+" : "Create [a-zA-Z]+"/g, '? "Update" : "Create"');
  
  fs.writeFileSync(filepath, content);
  console.log('Fixed ' + f);
});
