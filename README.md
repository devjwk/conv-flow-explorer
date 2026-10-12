# CPRE 487 Lab Flow Explorer

**Explore how values move through a neural network, one layer and one calculation at a time.**

[Live site](https://devjwk.github.io/conv-flow-explorer/) · [한국어 안내](README.ko.md) · Korean / English interface · No npm dependencies

An interactive learning tool for understanding the flow of data through neural-network layers. It connects each layer's purpose, tensor shapes, small worked examples, step-by-step calculations, and source code. Explore **Convolution, Max Pooling, Flatten, Dense, and Softmax** in Korean or English. The ideas apply beyond one course; the current numerical examples and source excerpts are grounded in an Iowa State CPrE 487/587 CNN lab project.

The site shows how a value is selected, transformed, and passed to the next layer. Its 3D-style diagrams label spatial positions, channels, and vector lengths directly; the controls let you trace selected calculations and inspect the original code. The model-flow strip places these mechanisms in a complete 13-stage CNN sequence.

![Layer navigation and full model flow](docs/layers-menu-preview.jpg)

[English interface preview](docs/preview-en.jpg)

## Quick start

Clone and run the published repository:

```bash
git clone https://github.com/devjwk/conv-flow-explorer.git
cd conv-flow-explorer
python3 run.py --offline
```

Requires **Python 3.9+**. On Windows, use `py -3 run.py` if needed. The command picks a random seed and opens a local browser at port 8787. Stop the server with **Ctrl+C**. No Python packages, Node.js, or C++ compiler are needed for this mode.

To clone the public lab repositories and rebuild the included data:

```bash
python3 run.py
```

This mode also requires **Git**. It clones `devjwk/cpre487lab2` through `cpre487lab5` into `sources/` and reuses existing checkouts without pulling or resetting. Lab 1 is currently private and is not required to run this tool. An available C++17 compiler is used for an optional native reference; compilation can be skipped with `--no-native`.

## Explore

Start at the home page, then follow the data path:

| Layer | What you can see and test |
| --- | --- |
| Convolution | An input window and channel-wise filter slices become one output value; change the position, filter, seed, or small example values and trace each multiply-accumulate. |
| Max Pooling | A 2×2 window selects one maximum within each channel, reducing spatial size. |
| Flatten | A spatial position and channel map to one vector index while the value stays the same. |
| Dense | Every input contributes a weighted product to one output neuron; follow the running sum and bias. |
| Softmax | Class scores become normalized outputs; inspect exponentials, the shared denominator, and one selected result. |

Each page pairs a labeled 3D-style diagram and a small **illustrative** numeric example with a step-through calculation and an original Lab 2 source excerpt. The illustrative numbers explain the idea; the detailed layer workspaces use bundled Lab 2 data. The pages use representative stages: Conv 1, Pool 1, Flatten, Dense 1, and Softmax after Dense 2. Repeated stages in the 13-stage model strip link to the relevant mechanism page; the site does not numerically replay every stage.


| Mode | What to study |
| --- | --- |
| Small example | Editable 3×3×2 input and two 2×2×2 filters; first output is 20 |
| Real conv1 data | Original 64×64×3 input, 5×5×3×32 weights and 60×60×32 output |
| Random experiment | Seeded 4×4×3 input, three 2×2×3 filters and editable values |

- Choose `p`, `q`, and `m`; inspect any input channel `c`.
- Step forward/backward, autoplay, or finish all products for one output.
- Observe the input window, matching filter slice, running sum, array addresses, and highlighted code.
- Read original Lab 2–5 excerpts to connect float32 convolution to integer arithmetic and FPGA MAC units.
- Switch **KO / EN** in the header. Language changes preserve edited values, selection, and calculation progress. The choice is saved in the browser. Use `?lang=en` or `?lang=ko` for an explicit language.

Channel tabs only change the inspected channel. Every input channel still contributes to the output. The output map is a completed preview; the workbench traces one selected output.

## Reproduce an experiment

```bash
python3 run.py --offline --seed 4870
python3 run.py --port 0                  # choose an available local port
python3 run.py --existing-root ..        # reuse local cpre487lab2..5 checkouts
python3 run.py --prepare-only            # prepare data without starting a server
```

Random generation uses `xorshift32-v1`, with seeds from 1 to 4294967295. The same seed gives the same initial tensors: input 0–9, weights −2–2, bias −3–3. Manual edits are not encoded in the seed; applying it again restores the initial values. The random view starts on the filter with the strongest visible output; other filters remain selectable. A filter whose entire output is zero shows its raw sum and ReLU explanation. Random filters are study examples, not trained models.

The static home page can also be opened directly from `dist/index.html`; the convolution experiment is at `dist/convolution.html`. Keep all files in `dist/` together. Browser verification was performed over local HTTP.

## Code and data provenance

| Repository | Connection |
| --- | --- |
| [Lab 1](https://github.com/devjwk/cpre487lab1) (private) | TensorFlow training/data context; no Lab 1 files are bundled |
| [Lab 2](https://github.com/devjwk/cpre487lab2) | `computeNaive`, original float32 tensors, bias and ReLU |
| [Lab 3](https://github.com/devjwk/cpre487lab3) | Original VHDL multiply/accumulate pipeline excerpt |
| [Lab 4](https://github.com/devjwk/cpre487lab4) | Original integer convolution excerpt |
| [Lab 5](https://github.com/devjwk/cpre487lab5) | Original input patch sharing and `macGroup` call excerpt |

Bundled data comes from Lab 2: `data/image_0.bin`, `data/model/conv1_weights.bin`, `data/model/conv1_biases.bin`, and `data/image_0_data/layer_0_output.bin`. Byte counts and SHA-256 hashes are recorded in [the data manifest](validation/data-manifest.json).

Input layout is **HWC**, weights **RSCM**, output **PQM**. Stride 1, no padding, batch 1. Source excerpts retain their original text and line numbers. Lab checkouts, machine binaries, and local setup records are excluded from Git.

## Numerical checks and limits

The calculation uses `Math.fround` for float32 multiplication and accumulation in the original `r,s,c` order. The native reference calls the original Lab 2 C++ implementation, compiled with `-O0 -ffp-contract=off`.

Recorded checks:

- Pool 1: all 25,088 outputs matched the Lab 2 reference exactly; Flatten: all 2,048 values matched exactly.
- Dense 1: 256 outputs were checked with JavaScript float32 arithmetic; maximum absolute difference from the reference was 2.86102294921875e-6.
- Softmax after Dense 2: maximum absolute difference across 200 values was 8.937005191445024e-8; computed values summed to about 0.99999993.

- All **115,200** real conv1 outputs matched the native C++ reference exactly.
- Maximum absolute error against the TensorFlow reference: **2.384185791015625e-7**.
- All 27 outputs for each seed **4870, 4871, 4294967295** matched native C++ exactly.

See [real-data verification](validation/verification.json) and [random verification](validation/random-verification.json). To regenerate native checks, install a C++17 compiler and Node.js:

```bash
python3 run.py --prepare-only
node tools/verify.cjs
node tools/verify_random.cjs
```

Displayed numbers are rounded; calculation uses original float32 values. Channel partial sums are an explanatory breakdown, accumulated as JavaScript numbers; the final output is computed from the original single float32 accumulator.

The general teaching goal is to make neural-network layer flow understandable through code-backed experiments. The implemented numerical scope is this CNN's representative layers, including **Lab 2 float32 conv1**; it is not a simulator for every architecture or hidden-layer type. Lab 3–5 source tabs explain connections; they do not simulate FPGA cycles, AXI handshakes, integer inference, or physical board execution. Python startup has been tested on macOS; Windows/Linux runtime validation is not claimed.

## Project structure

```text
dist/          Home and five static layer pages, translations, computation, embedded data
run.py         Standard-library launcher and optional lab preparation
tools/         Data exporter, original C++ wrapper, numerical checks, ZIP packager
validation/    Recorded numerical checks and source data manifest
docs/          Interface preview
```

This repository contains the learning interface and selected attributed lab excerpts/data. Original course materials and lab code remain associated with their respective sources; this repository does not assign a new license to them.
