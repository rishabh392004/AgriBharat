FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU-only first for fast download and small memory footprint
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch==2.2.1 torchvision==0.17.1 --index-url https://download.pytorch.org/whl/cpu

# Copy requirements and install remaining dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source, weights, and models
COPY . .

# Default port
ENV PORT=8000

EXPOSE 8000

# Run FastAPI app with dynamic port binding for Render/Railway/Fly.io
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
