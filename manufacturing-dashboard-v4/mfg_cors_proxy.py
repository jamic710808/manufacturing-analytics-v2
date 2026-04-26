#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
製造業分析儀表板 V4 — CORS Proxy Server
  智慧 CORS Proxy，轉發至任意 AI API（目標 URL 由 ?url= 決定）

使用方式：
  python mfg_cors_proxy.py          # 預設 Port 8080
  python mfg_cors_proxy.py 9000     # 指定 Port

啟動後：
  1. Vite 開發伺服器仍跑在 localhost:3000（另開終端機 npm run dev）
  2. AI 面板 → 設定 → 勾選「繞過 CORS 代理」
  3. 端點 URL 照填原本的 https://api.xxx.com/v1，請求自動轉發至此代理
"""

import sys, ssl, json
import urllib.request, urllib.error
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, unquote, parse_qs

PORT       = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
PROXY_PATH = '/proxy'


class ProxyHandler(BaseHTTPRequestHandler):

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header(
            'Access-Control-Allow-Headers',
            'Authorization, Content-Type, x-api-key, '
            'anthropic-version, anthropic-dangerous-direct-browser-access, '
            'HTTP-Referer, X-Title'
        )

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.send_header('Content-Length', '0')
        self.end_headers()

    def do_GET(self):
        if self.path.startswith(PROXY_PATH):
            self._proxy('GET')
        else:
            self._health()

    def do_POST(self):
        if self.path.startswith(PROXY_PATH):
            self._proxy('POST')
        else:
            self.send_error(405)

    # ── 健康檢查 ──────────────────────────────────────────────────────
    def _health(self):
        data = json.dumps({'status': 'ok', 'port': PORT}).encode()
        self.send_response(200)
        self._cors()
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    # ── CORS Proxy ────────────────────────────────────────────────────
    def _proxy(self, method):
        parsed_req = urlparse(self.path)
        qs = parse_qs(parsed_req.query)
        url_list = qs.get('url', [])
        if not url_list:
            err = json.dumps({'error': '缺少 ?url= 參數'}).encode()
            self.send_response(400); self._cors()
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(err)))
            self.end_headers(); self.wfile.write(err); return

        target_url = unquote(url_list[0])
        parsed     = urlparse(target_url)

        length = int(self.headers.get('Content-Length', 0))
        body   = self.rfile.read(length) if length else None

        SKIP = {'host', 'content-length', 'connection',
                'transfer-encoding', 'te', 'trailer'}
        fwd = {}
        for k, v in self.headers.items():
            if k.lower() not in SKIP:
                fwd[k] = v
        fwd['Host'] = parsed.netloc

        # 日誌
        auth = fwd.get('Authorization') or fwd.get('authorization', '')
        key  = fwd.get('x-api-key') or fwd.get('X-Api-Key', '')
        print(f'  [PROXY] → {target_url}')
        if auth:   print(f'  [AUTH ] ✅ Bearer …{auth[-6:]}')
        elif key:  print(f'  [AUTH ] ✅ x-api-key …{key[-6:]}')
        else:      print(f'  [AUTH ] ❌ 缺少認證 header')

        ctx = ssl.create_default_context()
        req = urllib.request.Request(target_url, data=body, method=method)
        for k, v in fwd.items():
            req.add_unredirected_header(k, v)

        try:
            with urllib.request.urlopen(req, context=ctx, timeout=120) as r:
                self.send_response(r.status)
                self._cors()
                SKIP_RESP = {
                    'access-control-allow-origin',
                    'access-control-allow-headers',
                    'access-control-allow-methods',
                    'transfer-encoding',
                    'connection',
                }
                for k, v in r.headers.items():
                    if k.lower() in SKIP_RESP:
                        continue
                    self.send_header(k, v)
                self.end_headers()
                while True:
                    chunk = r.read(4096)
                    if not chunk:
                        break
                    try:
                        self.wfile.write(chunk)
                        self.wfile.flush()
                    except BrokenPipeError:
                        break

        except urllib.error.HTTPError as e:
            body_err = e.read()
            self.send_response(e.code); self._cors()
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body_err)))
            self.end_headers(); self.wfile.write(body_err)

        except Exception as ex:
            msg = json.dumps({'error': str(ex)}).encode()
            self.send_response(502); self._cors()
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(msg)))
            self.end_headers(); self.wfile.write(msg)

    def log_message(self, fmt, *args):
        try:
            status = args[1]
            path   = args[0].split('"')[1] if '"' in args[0] else args[0]
            print(f'  [{status}] {path}')
        except Exception:
            pass


if __name__ == '__main__':
    print('=' * 55)
    print('  製造業分析儀表板 V4 — CORS Proxy Server')
    print()
    print(f'  Proxy 位址：http://localhost:{PORT}/proxy')
    print()
    print('  使用方式：')
    print('    1. 另開終端機：npm run dev（Vite 跑在 :3000）')
    print('    2. AI 面板 → 設定 → 勾選「繞過 CORS 代理」')
    print('    3. 端點照填原本的 https://api.xxx.com/v1')
    print('=' * 55)
    server = HTTPServer(('', PORT), ProxyHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n代理伺服器已停止。')
