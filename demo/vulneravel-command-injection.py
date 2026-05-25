# ❌ VULNERÁVEL — Command Injection
# Este código executa comandos shell com input do usuário
# Permite que um atacante execute qualquer comando no servidor

import os
import subprocess
from flask import Flask, request

app = Flask(__name__)

@app.route('/ping')
def ping_host():
    host = request.args.get('host')
    # VULNERÁVEL: shell=True com input do usuário
    result = subprocess.run(f"ping -c 1 {host}", shell=True, capture_output=True, text=True)
    return result.stdout

@app.route('/convert')
def convert_file():
    filename = request.args.get('file')
    # VULNERÁVEL: os.system com input do usuário
    os.system(f"convert {filename} output.pdf")
    return "Converted"

@app.route('/search')
def search_logs():
    term = request.args.get('term')
    # VULNERÁVEL: eval com input do usuário
    result = eval(f"grep_logs('{term}')")
    return str(result)
