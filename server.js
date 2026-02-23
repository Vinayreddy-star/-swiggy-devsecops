const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send(`
    <h1>🚀 Swiggy DevSecOps CI/CD Pipeline</h1>
    <p>Build ID: ${process.env.BUILD_NUMBER || 'local'}</p>
    <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
  `);
});
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    build: process.env.BUILD_NUMBER || 'local',
    timestamp: new Date().toISOString()
  });
});
app.listen(port, () => {
  console.log(`Swiggy app listening on port ${port}`);
});
