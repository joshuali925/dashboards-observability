/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import http, { RequestOptions } from 'http';
import https from 'https';

export function request(url: string, { body, ...options }: RequestOptions & { body: any }) {
  return new Promise((resolve, reject) => {
    const req = (url.startsWith('https://') || options.protocol === 'https' ? https : http).request(
      url,
      {
        ...options,
      },
      (res) => {
        const chunks: Uint8Array[] = [];
        res.on('data', (data) => chunks.push(data));
        res.on('end', () => {
          let resBody = Buffer.concat(chunks);
          switch (res.headers['content-type']) {
            case 'application/json':
              resBody = JSON.parse(resBody.toString());
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
