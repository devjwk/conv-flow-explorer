#!/usr/bin/env python3
"""Compare a student's Lab 2 float32 layer dumps with the reference outputs."""
import argparse
import json
import math
from pathlib import Path
import struct
import sys

SHAPES = [(60,60,32),(56,56,32),(28,28,32),(26,26,64),(24,24,64),
          (12,12,64),(10,10,64),(8,8,128),(4,4,128),(2048,),(256,),(200,)]
NAMES = ['Conv 1','Conv 2','Pool 1','Conv 3','Conv 4','Pool 2',
         'Conv 5','Conv 6','Pool 3','Flatten','Dense 1','Dense 2 + Softmax']

def values(path, count):
    raw = path.read_bytes()
    if len(raw) != count * 4:
        raise ValueError(f'{path}: expected {count * 4} bytes ({count} float32), got {len(raw)}')
    return struct.unpack('<' + str(count) + 'f', raw)

def coordinates(index, shape):
    if len(shape) == 1:
        return {'index': index}
    h, w, c = shape
    return {'row': index // (w*c), 'column': (index // c) % w, 'channel': index % c}

def inspect(reference, candidate, atol, rtol):
    rows=[]
    first_failure=None
    for layer, (name, shape) in enumerate(zip(NAMES, SHAPES)):
        filename=f'layer_{layer}_output.bin'
        ref_file=reference/filename
        got_file=candidate/filename
        count=math.prod(shape)
        if not ref_file.is_file():
            raise ValueError(f'Missing reference: {ref_file}')
        if not got_file.is_file():
            row={'layer':layer,'name':name,'status':'missing','file':str(got_file)}
        elif got_file.stat().st_size != count*4:
            row={'layer':layer,'name':name,'status':'invalid_size','file':str(got_file),
                 'expectedBytes':count*4,'actualBytes':got_file.stat().st_size}
        else:
            expected=values(ref_file,count)
            actual=values(got_file,count)
            mismatch=None
            max_error=0.0
            failed=0
            for index,(want,got) in enumerate(zip(expected,actual)):
                error=abs(want-got)
                passes=math.isfinite(want) and math.isfinite(got) and error <= atol + rtol*abs(want)
                if not passes:
                    failed+=1
                    if mismatch is None:
                        mismatch={'index':index,'coordinate':coordinates(index,shape),
                                  'expected':want if math.isfinite(want) else str(want),
                                  'actual':got if math.isfinite(got) else str(got),
                                  'absoluteError':error if math.isfinite(error) else str(error)}
                if math.isfinite(error): max_error=max(max_error,error)
            row={'layer':layer,'name':name,'status':'pass' if failed==0 else 'fail',
                 'shape':shape,'elements':count,'failedElements':failed,
                 'maxAbsoluteError':max_error,'firstMismatch':mismatch}
        rows.append(row)
        if first_failure is None and row['status']!='pass': first_failure=row
    return {'pass':first_failure is None,'firstFailure':first_failure,'layers':rows,
            'tolerance':{'absolute':atol,'relative':rtol},
            'format':'little-endian float32; HWC for spatial layers'}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('candidate',type=Path,help='Directory containing layer_0_output.bin through layer_11_output.bin')
    parser.add_argument('--reference',type=Path,help='Reference image_N_data directory (default: bundled image 0)')
    parser.add_argument('--atol',type=float,default=1e-5)
    parser.add_argument('--rtol',type=float,default=1e-5)
    parser.add_argument('--json',action='store_true',help='Print machine-readable results')
    args=parser.parse_args()
    if not all(math.isfinite(v) and v>=0 for v in (args.atol,args.rtol)):
        parser.error('tolerances must be finite and nonnegative')
    reference=args.reference or Path(__file__).resolve().parents[1]/'reference'/'image_0_data'
    try:
        result=inspect(reference,args.candidate,args.atol,args.rtol)
    except (OSError,ValueError) as error:
        parser.exit(2,f'Input error: {error}\n')
    if args.json:
        print(json.dumps(result,indent=2,allow_nan=False))
    else:
        for row in result['layers']:
            print(f"{row['layer']:>2} {row['name']:<20} {row['status'].upper()}",end='')
            if row['status']=='fail':
                point=row['firstMismatch']
                print(f"  first {point['coordinate']}: expected {point['expected']}, got {point['actual']}; {row['failedElements']} mismatches",end='')
            elif row['status']=='invalid_size':
                print(f"  expected {row['expectedBytes']} bytes, got {row['actualBytes']}",end='')
            print()
        print('All layers match.' if result['pass'] else f"First failing layer: {result['firstFailure']['name']}")
    return 0 if result['pass'] else 1

if __name__=='__main__':
    sys.exit(main())
