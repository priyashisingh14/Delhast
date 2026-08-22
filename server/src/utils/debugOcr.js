const fs = require('fs');
const path = require('path');
const ocrService = require('../services/ocr/ocr.service');
const { connectDB, disconnectDB } = require('../config/db');

(async () => {
  await connectDB();
  const cardPath = path.resolve(__dirname, '../../../sample-id-cards/mismatch_name_id.png');
  const buffer = fs.readFileSync(cardPath);
  const result = await ocrService.processIdCard(buffer);
  console.log('OCR Output for mismatch_name_id.png:');
  console.log('Raw text:\n', result.rawText);
  console.log('Extracted:', result.extracted);
  await disconnectDB();
})();
