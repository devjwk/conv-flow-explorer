# Browser verification

URL: http://127.0.0.1:8765/dist/

- Small example: first product 1; second channel product 9; running sum 10.
- Small example filter 0 output 20; filter 1 output 14 with channel sums 3 and 11.
- Native keyboard edit: first input value 1 -> 3; output 20 -> 22.
- Bias set to -100: final sum -78, ReLU output 0.
- Reset example; autoplay reached 8/8 MACs with sum/output 20.
- Real conv1: channel sequence c=0,1,2; output (0,0,0) final sum -0.0696859, ReLU output 0.
- Real last output (59,59,31): 75/75 MACs, output 0.0584568; native C++ same displayed result, TensorFlow absolute error about 3.353e-8.
- Console errors/warnings: none reported in observed interactions.
- Screenshot: preview.jpg shows small-example step 2 and code highlight.
- Default narrow and desktop layouts were visually inspected; real data matrix cells are compact with square corners for readability, detailed values remain in calculation/hover text.
- Direct file URL browser verification was blocked by the automation browser's allowed-protocol policy. No bypass attempted. All application scripts/styles/data are local files, and no fetch or external asset dependency is used.

No hardware-board verification is included.

## Seeded portable mode

- `run.py --offline --seed 4870 --no-browser --port 8787` started successfully; printed /dist/?seed=4870 URL.
- Query seed selected random mode on load with H=4,W=4,C=3,R=2,S=2,M=3 and 12 MACs per output.
- Seed 4870 / m=1 / p=q=0 output was 3; completion sum/ReLU was 3.
- Seed 0 was rejected with a visible validation message.
- New random assignment generated another valid seed; reapplying 4870 restored c=0 patch [4,4;7,5].
- Seed was preserved in the browser URL; single steps reached 2/12 MACs.
- Console errors/warnings: none observed.
- Screenshot: random-preview.jpg.

## Korean / English interface

- Switching KO / EN at step 1 preserved 1/8 MACs and translated the current product description.
- English completion reached final sum / ReLU 20 in the small example.
- Static labels, dynamic matrix labels, code source descriptions and accessible labels have translations.
- Interface preview: docs/preview-en.jpg.
