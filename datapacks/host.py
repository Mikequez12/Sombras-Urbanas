import http.server
import socketserver
import threading
import os
import signal

PORT = int(input("Input PORT > "))

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def debuger():
    while True:
        command = input("").strip().lower()
        if command == "stop":
            print("Shutting down the server...")
            os._exit(0)
        elif command == "restart":
            print("Restarting is not implemented yet.")
        else:
            print("Unknown command.")
            print('\n| · HELP ·\n| [RESTART] [STOP]\n')

def signal_handler(sig, frame):
    print("\nShutting down gracefully...")
    os._exit(0)

signal.signal(signal.SIGINT, signal_handler)

try:
    with socketserver.TCPServer(("127.0.0.1", PORT), MyHandler) as httpd:
        print(f"Serving at port {PORT}")
        threading.Thread(target=debuger, daemon=True).start()
        httpd.serve_forever()
except OSError as e:
    print(f"Error: {e}")
