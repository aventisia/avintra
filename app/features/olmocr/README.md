### Installation and Setup

Install dependencies (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install poppler-utils ttf-mscorefonts-installer msttcorefonts fonts-crosextra-caladea fonts-crosextra-carlito gsfonts lcdf-typetools
```

Add DeepInfra API Key to `llmpipeline.env` file:

```bash
DEEPINFRA_API_KEY=your_deepinfra_api_key_here
```

Install olmOCR package for cpu use only:

```bash
pip install 'olmocr[bench]''
```

Remove nvidia/cuda related packages if installed:

```bash
pip uninstall nvidia-cublas-cu12 nvidia-cuda-cupti-cu12 nvidia-cuda-nvrtc-cu12 nvidia-cuda-runtime-cu12 nvidia-cudnn-cu12 nvidia-cufft-cu12 nvidia-cufile-cu12 nvidia-curand-cu12 nvidia-cusolver-cu12 nvidia-cusparse-cu12 nvidia-cusparselt-cu12 nvidia-nccl-cu12 nvidia-nvjitlink-cu12 nvidia-nvshmem-cu12 nvidia-nvtx-cu12
```
