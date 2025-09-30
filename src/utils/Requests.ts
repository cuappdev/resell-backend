import fetch from 'node-fetch';
import FormData from 'form-data';
import { GetReportsResponse } from 'src/types/ApiResponses';

export async function externalRequest(url: string, method: string, body={}): Promise<any> {
  const response = await fetch(url, {
    method: method, // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/json', // 'application/x-www-form-urlencoded'
    },
    body: JSON.stringify(body) // body data type must match "Content-Type" header
  });
  return await response.clone().json();
}

export async function uploadImage(imageBase64: string): Promise<any> {
  if (!process.env.IMAGE_UPLOAD_URL) {
    throw new Error('IMAGE_UPLOAD_URL is not defined');
  }

  // Convert base64 to buffer
  const imageBuffer = Buffer.from(imageBase64, 'base64');
  const form = new FormData();
  form.append('image', imageBuffer, { filename: 'image.jpg' });
  
  if (process.env.UPLOAD_BUCKET_NAME) {
    form.append('bucket', process.env.UPLOAD_BUCKET_NAME);
  }
  const response = await fetch(process.env.IMAGE_UPLOAD_URL, {
    method: 'POST',
    body: form,
  });
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
  return await response.json();
}

export function reportToString(reports: GetReportsResponse): string {
  let reportString = '';
  reports.reports.forEach((report) => {
    reportString += `Report ID: ${report.id}<br>`;
    reportString += `Reporter: ${report.reporter.username}<br>`;
    reportString += `Reported: ${report.reported.username}<br>`;
    reportString += `Type: ${report.type}<br>`;
    reportString += `Reason: ${report.reason}<br>`;
    reportString += `Resolved: ${report.resolved}<br>`;
    reportString += `Created At: ${report.created}<br><br>`;
  });
  return reportString;
}