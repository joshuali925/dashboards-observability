const https = require('http');

export function httpsPost(url: string, { body, ...options }) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: 'POST',
        ...options,
      },
      (res) => {
        const chunks = [];
        res.on('data', (data) => chunks.push(data));
        res.on('end', () => {
          let resBody = Buffer.concat(chunks);
          switch (res.headers['content-type']) {
            case 'application/json':
              resBody = JSON.parse(resBody);
              break;
          }
          resolve(resBody);
        });
      }
    );
    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}
