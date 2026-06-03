const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8089;
const PUBLIC_DIR = path.resolve(__dirname, '../');

http.createServer((req, res) => {
  // Decode URL in case of spaces/special characters
  const decodedUrl = decodeURIComponent(req.url);
  let filePath = path.join(PUBLIC_DIR, decodedUrl === '/' ? 'presentation.html' : decodedUrl);
  
  const extname = path.extname(filePath).toLowerCase();
  let contentType = 'text/html';
  if (extname === '.png') contentType = 'image/png';
  if (extname === '.css') contentType = 'text/css';
  if (extname === '.js') contentType = 'text/javascript';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
