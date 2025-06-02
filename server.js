<<<<<<< HEAD
const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
const PORT = 3999;

app.use(express.static('public'));

app.get('/api/data', (req, res) => {
  const results = [];
  fs.createReadStream('./data/data_phimart.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => res.json(results));
});

app.get('/api/cluster', (req, res) => {
  const results = [];
  fs.createReadStream('./data/cluster_phimart.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => res.json(results));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
=======
const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
const PORT = 3999;

app.use(express.static('public'));

app.get('/api/data', (req, res) => {
  const results = [];
  fs.createReadStream('./data/data_phimart.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => res.json(results));
});

app.get('/api/cluster', (req, res) => {
  const results = [];
  fs.createReadStream('./data/cluster_phimart.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => res.json(results));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
>>>>>>> 1366ce4f3b125e5ed9ae851d8f7630f8711d8a68
