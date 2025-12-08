const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Test server working' });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});