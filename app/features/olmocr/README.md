### Installation and Setup

Install dependencies (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install poppler-utils ttf-mscorefonts-installer msttcorefonts fonts-crosextra-caladea fonts-crosextra-carlito gsfonts lcdf-typetools
```

Install torch for cpu-only usage:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

Install olmOCR package with no dependencies to avoid downloading nvidia packages:

```bash
pip install olmocr --no-deps
```
