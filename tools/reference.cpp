// Calls the unchanged Lab 2 convolution implementation.
#include "layers/Convolutional.h"
int main(int argc, char** argv) {
    using namespace ML;
    const Path root=argc>1 ? argv[1] : "../cpre487lab2/data";
    const bool random = argc>2 && std::string(argv[2])=="random";
    const dimVec in=random ? dimVec{4,4,3} : dimVec{64,64,3};
    const dimVec outDims=random ? dimVec{3,3,3} : dimVec{60,60,32};
    const dimVec weights=random ? dimVec{2,2,3,3} : dimVec{5,5,3,32};
    LayerData image(LayerParams(sizeof(fp32),in,root/(random?"input.bin":"image_0.bin")));
    image.loadData();
    ConvolutionalLayer conv(
        LayerParams(sizeof(fp32),in),
        LayerParams(sizeof(fp32),outDims),
        LayerParams(sizeof(fp32),weights,root/(random?"weights.bin":"model/conv1_weights.bin")),
        LayerParams(sizeof(fp32),{outDims[2]},root/(random?"bias.bin":"model/conv1_biases.bin")));
    conv.allocLayer();
    conv.computeNaive(image);
    const Path output=argc>3 ? argv[3] : "validation/lab2_conv1_output.bin";
    std::ofstream out(output, std::ios::binary);
    out.write(static_cast<const char*>(conv.getOutputData().raw()),
              conv.getOutputData().getParams().byte_size());
    return out ? 0 : 1;
}
