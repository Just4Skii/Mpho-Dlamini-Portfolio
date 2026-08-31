import fs from 'fs';
import path from 'path';

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const rootDist = path.resolve('dist');
const portfolioDist = path.resolve('portfolio/dist');
const apexDist = path.resolve('projects/apex/dist');
const kasiDist = path.resolve('projects/kasicart/dist');
const carepointDist = path.resolve('projects/carepoint/dist');

// 1. Clean root dist
if (fs.existsSync(rootDist)) {
  fs.rmSync(rootDist, { recursive: true, force: true });
}
fs.mkdirSync(rootDist, { recursive: true });

// 2. Copy portfolio output to root dist
console.log('Copying portfolio output to dist/...');
copyDir(portfolioDist, rootDist);

// 3. Copy Apex output to dist/work/apex/
console.log('Copying Apex output to dist/work/apex/...');
const apexDest = path.join(rootDist, 'work', 'apex');
copyDir(apexDist, apexDest);

// 4. Copy KasiCart output to dist/work/kasicart/
console.log('Copying KasiCart output to dist/work/kasicart/...');
const kasiDest = path.join(rootDist, 'work', 'kasicart');
copyDir(kasiDist, kasiDest);

// 5. Copy CarePoint output to dist/work/carepoint/
console.log('Copying CarePoint output to dist/work/carepoint/...');
const carepointDest = path.join(rootDist, 'work', 'carepoint');
copyDir(carepointDist, carepointDest);

// 6. Ensure CNAME
fs.writeFileSync(path.join(rootDist, 'CNAME'), 'graffgrid.co.za\n', 'utf-8');

// 7. Master 404.html for GitHub Pages multi-app SPA deep linking
const master404Html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>GraffGrid Platform</title>
  <script type="text/javascript">
    (function() {
      var l = window.location;
      var path = l.pathname;
      
      // Determine app prefix
      if (path.indexOf('/work/apex') === 0) {
        var base = '/work/apex';
        var rest = path.slice(base.length);
        if (rest === '' || rest === '/') {
          l.replace(l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') + base + '/');
        } else {
          l.replace(l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') + base + '/?/' + rest.slice(1).replace(/&/g, '~and~') + (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') + l.hash);
        }
      } else if (path.indexOf('/work/kasicart') === 0) {
        var base = '/work/kasicart';
        var rest = path.slice(base.length);
        if (rest === '' || rest === '/') {
          l.replace(l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') + base + '/');
        } else {
          l.replace(l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') + base + '/?/' + rest.slice(1).replace(/&/g, '~and~') + (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') + l.hash);
        }
      } else if (path.indexOf('/work/carepoint') === 0) {
        var base = '/work/carepoint';
        var rest = path.slice(base.length);
        if (rest === '' || rest === '/') {
          l.replace(l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') + base + '/');
        } else {
          l.replace(l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') + base + '/?/' + rest.slice(1).replace(/&/g, '~and~') + (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') + l.hash);
        }
      } else {
        l.replace(
          l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') + '/?/' +
          l.pathname.slice(1).replace(/&/g, '~and~') +
          (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
          l.hash
        );
      }
    })();
  </script>
</head>
<body>
</body>
</html>
`;

fs.writeFileSync(path.join(rootDist, '404.html'), master404Html, 'utf-8');

console.log('--- Static distribution assembly complete! ---');
