# ✅ CORRIGIDO — Command Injection Prevention
# Todas as execuções de comandos usam APIs seguras sem shell
# Input do usuário é validado contra whitelist

import re
import subprocess
from flask import Flask, request, abort

app = Flask(__name__)

# Whitelist de caracteres permitidos para hostname
HOSTNAME_PATTERN = re.compile(r'^[a-zA-Z0-9.\-]+$')
# Whitelist de extensões de arquivo permitidas
ALLOWED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.tiff', '.bmp'}
# Tamanho máximo de input
MAX_INPUT_LENGTH = 253


@app.route('/ping')
def ping_host():
    host = request.args.get('host', '')

    # Validação: tamanho máximo
    if not host or len(host) > MAX_INPUT_LENGTH:
        abort(400, description="Host inválido")

    # Validação: whitelist de caracteres (apenas hostname válido)
    if not HOSTNAME_PATTERN.match(host):
        abort(400, description="Host contém caracteres não permitidos")

    # SEGURO: lista de argumentos sem shell=True
    try:
        result = subprocess.run(
            ["ping", "-c", "1", "-W", "3", host],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.stdout
    except subprocess.TimeoutExpired:
        abort(504, description="Timeout ao conectar ao host")


@app.route('/convert')
def convert_file():
    filename = request.args.get('file', '')

    # Validação: tamanho máximo
    if not filename or len(filename) > 255:
        abort(400, description="Nome de arquivo inválido")

    # Validação: apenas caracteres alfanuméricos, ponto, hífen e underscore
    if not re.match(r'^[a-zA-Z0-9_\-]+\.[a-zA-Z0-9]+$', filename):
        abort(400, description="Nome de arquivo contém caracteres não permitidos")

    # Validação: extensão permitida
    ext = '.' + filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    if ext not in ALLOWED_EXTENSIONS:
        abort(400, description="Extensão de arquivo não permitida")

    # SEGURO: lista de argumentos sem shell
    try:
        subprocess.run(
            ["convert", filename, "output.pdf"],
            capture_output=True,
            timeout=30,
            check=True
        )
        return "Converted"
    except subprocess.CalledProcessError:
        abort(500, description="Erro na conversão")
    except subprocess.TimeoutExpired:
        abort(504, description="Timeout na conversão")


@app.route('/search')
def search_logs():
    term = request.args.get('term', '')

    # Validação: tamanho máximo
    if not term or len(term) > 100:
        abort(400, description="Termo de busca inválido")

    # Validação: apenas alfanuméricos e espaços (sem caracteres especiais)
    if not re.match(r'^[a-zA-Z0-9\s\-_.@]+$', term):
        abort(400, description="Termo contém caracteres não permitidos")

    # SEGURO: busca em arquivo sem eval/exec
    results = []
    try:
        with open('/var/log/app.log', 'r') as f:
            for line in f:
                if term.lower() in line.lower():
                    results.append(line.strip())
                # Limitar resultados para evitar DoS
                if len(results) >= 100:
                    break
    except FileNotFoundError:
        abort(404, description="Log não encontrado")

    return '\n'.join(results)
