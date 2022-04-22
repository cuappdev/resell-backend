import fetch from 'node-fetch';

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

export async function uploadImage(image_base64: string): Promise<any> {
  const requestBody = {
    bucket: process.env.UPLOAD_BUCKET_NAME,
    image: image_base64
  }
  if (process.env.IMAGE_UPLOAD_URL === undefined) {
    throw new Error('IMAGE_UPLOAD_URL is not defined');
  }
  return await externalRequest(process.env.IMAGE_UPLOAD_URL, 'POST', requestBody);
}