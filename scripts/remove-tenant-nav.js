const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../app/[slug]');

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (file === 'page.jsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Remove TenantNav import
      content = content.replace(/import TenantNav from ['"].*?tenant-nav['"];?\n?/g, '');
      
      // Remove TenantNav usage
      content = content.replace(/<TenantNav[^>]*\/>\n?/g, '');
      
      // We will leave the div and main tags for now, Phase 4-10 will replace the inner content anyway.
      // But we can easily remove `<div className="min-h-screen bg-neutral-50">` and its closing tag if we want.
      // Actually, it's safer to just remove TenantNav, and let layout.jsx provide the Sidebar/TopBar.
      // Wait, if we keep `<div className="min-h-screen...">`, it will have a double background.
      // Let's strip the `<div className="min-h-screen bg-neutral-50">` and its matching `</div>`.
      // And replace `<main className="p-6">` with `<div className="w-full">` or just leave `<main className="p-6">`.
      
      fs.writeFileSync(fullPath, content);
      console.log(`Processed ${fullPath}`);
    }
  }
}

processDirectory(dir);
