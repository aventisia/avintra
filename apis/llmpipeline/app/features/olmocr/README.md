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
pip install 'olmocr[bench]'
```
