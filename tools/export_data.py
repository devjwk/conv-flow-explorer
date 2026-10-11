"""Export repository data and exact code excerpts. Standard library only."""
import argparse
import base64
import hashlib
import json
from pathlib import Path

APP = Path(__file__).resolve().parents[1]
SOURCES = [
    ('lab2', 'Lab 2 · 실제 convolution', 'cpre487lab2/src/layers/Convolutional.cpp',13,45),
    ('lab4', 'Lab 4 · 정수 convolution', 'cpre487lab4/lab4/framework/src/layers/Convolutional.cpp',107,124),
    ('lab5', 'Lab 5 · patch → hardware MAC', 'cpre487lab5/sw/framework/src/layers/Convolutional.cpp',182,205),
    ('lab3', 'Lab 3 · multiply / accumulate', 'cpre487lab3/piped_mac/hdl/piped_mac.vhd',142,169),
]
def export(repo_root, cpp_reference=None):
    root = Path(repo_root)
    paths = {
        'input': ('cpre487lab2/data/image_0.bin', 64*64*3*4),
        'weights': ('cpre487lab2/data/model/conv1_weights.bin', 5*5*3*32*4),
        'bias': ('cpre487lab2/data/model/conv1_biases.bin', 32*4),
        'reference': ('cpre487lab2/data/image_0_data/layer_0_output.bin', 60*60*32*4),
    }
    payload = {'H':64,'W':64,'C':3,'R':5,'S':5,'M':32,'P':60,'Q':60}
    manifest = {}
    for key, (relative, expected_bytes) in paths.items():
        raw = (root / relative).read_bytes()
        if len(raw) != expected_bytes:
            raise ValueError(f'{relative}: expected {expected_bytes} bytes, got {len(raw)}')
        payload[key] = base64.b64encode(raw).decode()
        manifest[key] = {'path':relative,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
    if cpp_reference is not None:
        raw = Path(cpp_reference).read_bytes()
        if len(raw) != 60*60*32*4: raise ValueError('Native C++ output size mismatch')
        payload['cppReference'] = base64.b64encode(raw).decode()
        manifest['cppReference'] = {'path':'validation/lab2_conv1_output.bin','bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
    payload['sources'] = []
    for key, title, relative, start, end in SOURCES:
        lines=(root/relative).read_text(encoding='utf-8').splitlines()
        payload['sources'].append({'key':key,'title':title,'path':relative,'start':start,'code':'\n'.join(lines[start-1:end])})
    (APP/'dist/data.js').write_text('globalThis.CONV_DATA = '+json.dumps(payload,ensure_ascii=False)+';\n',encoding='utf-8')
    (APP/'validation').mkdir(exist_ok=True)
    (APP/'validation/data-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    print('Exported repository input, weights, bias and code excerpts.', flush=True)

if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo-root',type=Path,default=APP.parent)
    parser.add_argument('--cpp-reference',type=Path,default=APP/'validation/lab2_conv1_output.bin')
    args=parser.parse_args()
    export(args.repo_root,args.cpp_reference if args.cpp_reference.is_file() else None)
