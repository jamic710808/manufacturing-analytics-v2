/**
 * 製造業儀表板 V4 — Vercel Function CORS 代理（Node.js）
 * 用法：GET/POST /api/proxy?url=<encoded-target-url>
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': [
    'Authorization', 'Content-Type', 'x-api-key',
    'anthropic-version', 'anthropic-dangerous-direct-browser-access',
    'OpenAI-Organization', 'OpenAI-Beta',
    'HTTP-Referer', 'X-Title', 'api-key',
  ].join(', '),
  'Access-Control-Max-Age': '86400',
};

const SKIP_REQ_HEADERS = new Set([
  'host', 'content-length', 'connection', 'transfer-encoding',
  'te', 'trailer', 'upgrade', 'origin', 'referer',
  'x-vercel-id', 'x-vercel-deployment-url', 'x-real-ip',
  'x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto',
  'x-vercel-forwarded-for', 'x-vercel-ip-country',
  'x-vercel-ip-country-region', 'x-vercel-ip-city',
  'cdn-loop', 'forwarded',
]);

const SKIP_RESP_HEADERS = new Set([
  'access-control-allow-origin', 'access-control-allow-headers',
  'access-control-allow-methods', 'access-control-max-age',
  'content-encoding', 'content-length', 'transfer-encoding', 'connection',
]);

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS });
  res.end(JSON.stringify(body, null, 2));
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, CORS_HEADERS);
    res.end();
    return;
  }

  const baseUrl = `https://${req.headers.host}`;
  const parsedUrl = new URL(req.url, baseUrl);
  const target = parsedUrl.searchParams.get('url');

  if (!target) {
    sendJson(res, 400, { error: '缺少 ?url= 參數', hint: '用法：/api/proxy?url=https%3A%2F%2Fapi.openai.com%2F...' });
    return;
  }

  let targetUrl;
  try {
    targetUrl = new URL(target);
    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      sendJson(res, 400, { error: `不支援的協議：${targetUrl.protocol}` });
      return;
    }
  } catch {
    sendJson(res, 400, { error: `無效的目標 URL：${target.slice(0, 100)}` });
    return;
  }

  const fwdHeaders = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!SKIP_REQ_HEADERS.has(key.toLowerCase())) fwdHeaders[key] = value;
  }

  let body = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = Buffer.concat(chunks);
  }

  try {
    const upstream = await fetch(target, { method: req.method, headers: fwdHeaders, body, redirect: 'manual' });
    const respHeaders = { ...CORS_HEADERS };
    upstream.headers.forEach((value, key) => {
      if (!SKIP_RESP_HEADERS.has(key.toLowerCase())) respHeaders[key] = value;
    });
    res.writeHead(upstream.status, respHeaders);
    if (upstream.body) {
      const reader = upstream.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (e) {
    if (!res.headersSent) sendJson(res, 502, { error: `代理錯誤：${e.message}`, target: target.slice(0, 200) });
  }
}
