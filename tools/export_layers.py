"""Bundle the original Lab 2 float32 arrays used by the additional layer pages."""
import base64
import hashlib
import json
from pathlib import Path

APP=Path(__file__).resolve().parents[1]
FILES={
    'poolInput':('data/image_0_data/layer_1_output.bin',56*56*32),
    'poolOutput':('data/image_0_data/layer_2_output.bin',28*28*32),
    'flattenInput':('data/image_0_data/layer_8_output.bin',4*4*128),
    'flattenOutput':('data/image_0_data/layer_9_output.bin',2048),
    'denseInput':('data/image_0_data/layer_9_output.bin',2048),
    'denseWeights':('data/model/dense1_weights.bin',2048*256),
    'denseBias':('data/model/dense1_biases.bin',256),
    'denseOutput':('data/image_0_data/layer_10_output.bin',256),
    'dense2Weights':('data/model/dense2_weights.bin',256*200),
    'dense2Bias':('data/model/dense2_biases.bin',200),
    'softmaxOutput':('data/image_0_data/layer_11_output.bin',200),
}
SOURCES={
    'pool':('src/layers/MaxPooling.h',11,43),
    'flatten':('src/layers/Flatten.h',10,26),
    'dense':('src/layers/Dense.h',36,57),
    'softmax':('src/layers/Softmax.h',10,47),
}

def export(root):
    lab=Path(root)/'cpre487lab2'
    data={}
    manifest={}
    for name,(relative,count) in FILES.items():
        raw=(lab/relative).read_bytes()
        if len(raw)!=count*4:
            raise ValueError(f'{relative}: expected {count*4} bytes, got {len(raw)}')
        data[name]=base64.b64encode(raw).decode('ascii')
        manifest[name]={'path':f'cpre487lab2/{relative}','count':count,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
    data['sources']={}
    for name,(relative,start,end) in SOURCES.items():
        lines=(lab/relative).read_text().splitlines()
        data['sources'][name]={'path':f'cpre487lab2/{relative}','start':start,'code':'\n'.join(lines[start-1:end])}
    (APP/'dist/layer-data.js').write_text('globalThis.LAYER_DATA = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
    (APP/'validation/layer-data-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print('Exported Lab 2 layer inputs, weights, outputs, and code excerpts.',flush=True)

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo-root',type=Path,default=APP.parent)
    args=parser.parse_args()
    export(args.repo_root)
