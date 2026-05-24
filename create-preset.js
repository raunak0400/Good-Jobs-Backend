require('dotenv').config();
const https = require('https');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey    = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const auth      = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

const body = JSON.stringify({
  unsigned: true,
  resource_type: 'raw',
  folder: 'goodjob-resumes',
  allowed_formats: 'pdf,doc,docx',
  max_file_size: 5242880
});

const options = {
  hostname: 'api.cloudinary.com',
  path: `/v1_1/${cloudName}/upload_presets/goodjob_resumes`,
  method: 'PUT',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', data));
});
req.on('error', e => console.error(e));
req.write(body);
req.end();
