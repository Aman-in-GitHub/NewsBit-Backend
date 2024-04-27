import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import stream from 'stream';

const pipelinePromise = promisify(stream.pipeline);

export const downloadPDF = async (fileUrl, downloadName) => {
  const downloadPath = './downloads';

  if (!fileUrl || typeof fileUrl !== 'string') {
    throw new Error('Invalid file URL');
  }

  if (!downloadPath || typeof downloadPath !== 'string') {
    throw new Error('Invalid download path');
  }

  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath, { recursive: true });
  }

  const parsedUrl = new URL(fileUrl);
  const protocol = parsedUrl.protocol === 'https:' ? https : http;

  const agent = new https.Agent({
    rejectUnauthorized: false
  });

  try {
    const response = await new Promise((resolve, reject) => {
      const requestOptions = {
        agent: parsedUrl.protocol === 'https:' ? agent : undefined
      };
      const request = protocol.get(parsedUrl, requestOptions, (res) => {
        resolve(res);
      });

      request.on('error', (err) => {
        reject(err);
      });
    });

    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.startsWith('application/pdf')) {
      throw new Error('Invalid content type. Expected PDF file.');
    }

    const fileExtension = path.extname(parsedUrl.pathname) || '.pdf';
    const fileName = downloadName || `download${fileExtension}`;
    const filePath = path.join(downloadPath, fileName);

    const fileStream = fs.createWriteStream(filePath);
    await pipelinePromise(response, fileStream);

    console.log(`File downloaded successfully at ${filePath}`);
    return filePath;
  } catch (err) {
    console.error('Error downloading file:', err);
    throw err;
  }
};
