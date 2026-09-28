# Stage 1: Build stage
FROM python:3.12-slim AS builder
WORKDIR /build

# Install build dependencies if needed (e.g., gcc for some C-extensions)
# RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install dependencies into a separate directory
# Use --index-url if using PyTorch to target CPU specifically
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Final runtime stage
FROM python:3.12-slim
WORKDIR /app

# Copy only the installed packages from the builder
COPY --from=builder /install /usr/local
COPY . .

ENV PYTHONUNBUFFERED=1
EXPOSE 4003

# IMPORTANT NOTE: keep a single uvicorn worker. Chat tool-approval pauses live
# in this process (InMemorySaver + compiled-graph cache); `--workers > 1` or
# multiple replicas route resumes to workers without the pause (409 expired).
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "4003"]