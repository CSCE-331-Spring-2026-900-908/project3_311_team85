import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Emulate __dirname since it is not available in ES modules by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Serve the static files from the Vite build directory ('dist')
app.use(express.static(path.join(__dirname, 'dist')));

// 2. Catch-all route to hand frontend routing over to React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Web service listening on port ${PORT}`);
});