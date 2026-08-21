#!/usr/bin/env python3
"""No-cache HTTP server for LifePulse AI development."""
import http.server
import socketserver
import sys
import webbrowser

import os

DEFAULT_PORT = int(os.environ.get("PORT", 8000))
HOST = "0.0.0.0" if os.environ.get("PORT") else "127.0.0.1"

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, format, *args):
        print(f"  {self.address_string()} - {format % args}")

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

port = DEFAULT_PORT
httpd = None

if os.environ.get("PORT"):
    # Running in production environment like Render
    try:
        httpd = ReusableTCPServer((HOST, port), NoCacheHandler)
    except OSError as e:
        print(f"❌ Failed to bind to {HOST}:{port}: {e}")
        sys.exit(1)
else:
    # Local development auto-port search
    for p in range(DEFAULT_PORT, DEFAULT_PORT + 10):
        try:
            httpd = ReusableTCPServer((HOST, p), NoCacheHandler)
            port = p
            break
        except OSError:
            continue

if not httpd:
    print("❌ Could not bind to any port from 8000 to 8010.")
    sys.exit(1)

url = f"http://127.0.0.1:{port}"
print("=" * 60)
print("LifePulse AI Dev Server Running!")
print(f"Open in browser: {url}")
print("Cache disabled. Press Ctrl+C to stop.")
print("=" * 60)

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped.")

