#!/usr/bin/env python3
"""Clone public devjwk Labs 2–5, prepare Conv Explorer, and start a seeded experiment."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import secrets
import shutil
import subprocess
import sys
import webbrowser

APP=Path(__file__).resolve().parent
REPOS=[f'cpre487lab{n}' for n in range(2,6)]

def seed_number(value):
    number=int(value)
    if not 1<=number<=4294967295:
        raise argparse.ArgumentTypeError('Seed must be 1..4294967295')
    return number

def clone_repositories(root):
    if not shutil.which('git'):
        raise RuntimeError('Git is required. Install Git, or use --offline with the bundled data.')
    root.mkdir(parents=True,exist_ok=True)
    commits={}
    for repo in REPOS:
        target=root/repo
        expected=f'https://github.com/devjwk/{repo}.git'
        if target.exists():
            if not (target/'.git').exists():
                raise RuntimeError(f'{target} exists but is not a Git checkout. Choose another --sources directory.')
            origin=subprocess.check_output(['git','-C',str(target),'remote','get-url','origin'],text=True).strip()
            if origin.rstrip('/') not in [expected,expected[:-4]]:
                raise RuntimeError(f'{target} has a different origin. Choose another --sources directory.')
            print(f'Reusing {repo} (no reset/pull).',flush=True)
        else:
            print(f'Cloning devjwk/{repo} ...',flush=True)
            subprocess.run(['git','clone','--depth','1','--single-branch',expected,str(target)],check=True)
        commits[repo]=subprocess.check_output(['git','-C',str(target),'rev-parse','HEAD'],text=True).strip()
    return commits

def native_reference(root):
    compiler=shutil.which('clang++') or shutil.which('g++')
    if not compiler:
        print('C++ compiler unavailable: native comparison omitted; TensorFlow reference remains.',flush=True)
        return None
    src=root/'cpre487lab2/src'
    binary=APP/'validation'/('reference.exe' if os.name=='nt' else 'reference')
    output=APP/'validation/lab2_conv1_output.bin'
    command=[compiler,'-std=c++17','-O0','-ffp-contract=off','-I',str(src),str(APP/'tools/reference.cpp'),
             str(src/'layers/Convolutional.cpp'),str(src/'layers/Layer.cpp'),str(src/'Utils.cpp'),'-o',str(binary)]
    try:
        subprocess.run(command,check=True,cwd=APP)
        subprocess.run([str(binary),str(root/'cpre487lab2/data'),'real',str(output)],check=True,cwd=APP)
        print('Native Lab 2 reference generated.',flush=True)
        return output
    except (OSError,subprocess.CalledProcessError) as error:
        print(f'Native reference unavailable ({error}); continuing with TensorFlow reference.',flush=True)
        return None

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--seed',type=seed_number,help='Same seed gives the same initial random tensors on every platform.')
    parser.add_argument('--sources',type=Path,default=APP/'sources',help='Where the four public lab repositories are cloned.')
    parser.add_argument('--existing-root',type=Path,help='Use an existing directory containing cpre487lab2..5; no cloning.')
    parser.add_argument('--offline',action='store_true',help='Use bundled data/excerpts, skip clone and native compilation.')
    parser.add_argument('--no-native',action='store_true',help='Skip optional native C++ reference generation.')
    parser.add_argument('--prepare-only',action='store_true',help='Prepare files and exit without starting a server.')
    parser.add_argument('--no-browser',action='store_true',help='Print the URL without opening the default browser.')
    parser.add_argument('--port',type=int,default=8787,help='Local port; use 0 to select an available port automatically.')
    args=parser.parse_args()
    if not 0<=args.port<=65535: parser.error('--port must be 0..65535')
    if args.offline and args.existing_root: parser.error('--offline and --existing-root cannot be combined')
    seed=args.seed if args.seed is not None else secrets.randbelow(4294967295)+1
    (APP/'validation').mkdir(exist_ok=True)
    commits={}
    if not args.offline:
        root=(args.existing_root or args.sources).resolve()
        if args.existing_root:
            for repo in REPOS:
                if not (root/repo).is_dir(): raise RuntimeError(f'Missing {root/repo}')
            for repo in REPOS:
                commits[repo]=subprocess.check_output(['git','-C',str(root/repo),'rev-parse','HEAD'],text=True).strip()
        else:
            commits=clone_repositories(root)
        native=None if args.no_native else native_reference(root)
        from tools.export_data import export
        export(root,native)
    elif not (APP/'dist/data.js').is_file():
        raise RuntimeError('Bundled dist/data.js is missing; run without --offline to rebuild it.')
    record={'seed':seed,'mode':'offline' if args.offline else 'existing' if args.existing_root else 'clone',
            'repositoryCommits':commits,'randomAlgorithm':'xorshift32-v1','randomShape':{'H':4,'W':4,'C':3,'R':2,'S':2,'M':3}}
    (APP/'validation/setup.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
    print(f'Prepared experiment. Seed: {seed}',flush=True)
    if args.prepare_only: return
    handler=partial(SimpleHTTPRequestHandler,directory=str(APP))
    try:
        server=ThreadingHTTPServer(('127.0.0.1',args.port),handler)
    except OSError as error:
        raise RuntimeError(f'Cannot start local server: {error}. Try --port 0.') from error
    url=f'http://127.0.0.1:{server.server_port}/dist/?seed={seed}'
    print(f'Open: {url}\nCtrl+C stops the server.',flush=True)
    if not args.no_browser: webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped.')
    finally:
        server.server_close()

if __name__=='__main__':
    try:
        main()
    except (RuntimeError,OSError,ValueError,subprocess.CalledProcessError) as error:
        print(f'Setup failed: {error}',file=sys.stderr)
        sys.exit(1)
