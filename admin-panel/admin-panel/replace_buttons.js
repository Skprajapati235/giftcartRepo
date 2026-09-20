const fs = require('fs');
const path = require('path');

const files = [
  'src/app/components/category/addEditCategory.tsx',
  'src/app/components/coupons/addEditCoupon.tsx',
  'src/app/components/city/addEditCity.tsx',
  'src/app/components/occasions/addEditOccasion.tsx',
  'src/app/components/flavors/addEditFlavor.tsx',
  'src/app/components/leads/addEditLead.tsx',
  'src/app/components/crm/addEditCrm.tsx',
  'src/app/components/adminProfile/adminEdit.tsx'
];

files.forEach(f => {
  const filepath = path.join(__dirname, f);
  if (!fs.existsSync(filepath)) return;
  
  let content = fs.readFileSync(filepath, 'utf8');
  let lines = content.split('\n');
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    // Only modify lines with className for buttons
    if (lines[i].includes('className') && (lines[i].includes('button') || lines[i - 1]?.includes('<button') || lines[i - 2]?.includes('<button'))) {
      if (lines[i].includes('px-6 py-4') || lines[i].includes('px-8 py-5') || lines[i].includes('py-4') || lines[i].includes('py-5')) {
        lines[i] = lines[i].replace(/px-6 py-4/g, 'px-4 py-2 text-sm');
        lines[i] = lines[i].replace(/px-8 py-5/g, 'px-4 py-2 text-sm');
        lines[i] = lines[i].replace(/py-4 /g, 'py-2 text-sm ');
        lines[i] = lines[i].replace(/py-5 /g, 'py-2 text-sm ');
        lines[i] = lines[i].replace(/rounded-2xl/g, 'rounded-xl');
        modified = true;
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(filepath, lines.join('\n'));
    console.log('Updated ' + f);
  }
});
