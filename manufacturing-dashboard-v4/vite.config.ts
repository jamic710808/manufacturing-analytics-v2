import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'http';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'cors-proxy',
      configureServer(server) {
        server.middlewares.use(
          '/dev-proxy',
          async (req: IncomingMessage, res: ServerResponse) => {
            // CORS preflight
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', '*');
            if (req.method === 'OPTIONS') {
              res.writeHead(204);
              res.end();
              return;
            }

            const qs = req.url?.split('?')[1] ?? '';
            const targetUrl = new URLSearchParams(qs).get('url');
            if (!targetUrl) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: 'Missing ?url= parameter' }));
              return;
            }

            // 讀取 request body
            const body = await new Promise<Buffer>((resolve) => {
              const chunks: Buffer[] = [];
              req.on('data', (chunk: Buffer) => chunks.push(chunk));
              req.on('end', () => resolve(Buffer.concat(chunks)));
            });

            // 轉發 header（去掉 host/origin/referer 避免被拒）
            const forwardHeaders: Record<string, string> = {};
            for (const [k, v] of Object.entries(req.headers)) {
              if (['host', 'origin', 'referer'].includes(k)) continue;
              if (typeof v === 'string') forwardHeaders[k] = v;
            }

            try {
              const upstream = await fetch(targetUrl, {
                method: req.method ?? 'POST',
                headers: forwardHeaders,
                body: req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined,
              });

              res.writeHead(upstream.status, {
                'content-type': upstream.headers.get('content-type') ?? 'application/json',
                'access-control-allow-origin': '*',
              });

              // 支援 streaming
              const reader = upstream.body?.getReader();
              if (reader) {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  res.write(value);
                }
              }
              res.end();
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : String(e);
              res.writeHead(502);
              res.end(JSON.stringify({ error: msg }));
            }
          }
        );
      },
    },
  ],
  server: {
    port: 3000,
    open: true,
  },
});
