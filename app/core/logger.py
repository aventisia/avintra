import logging
import sys

# Configure logging format
LOG_FORMAT = "%(asctime)s - %(levelname)s - %(message)s"

# Create logger
logger = logging.getLogger("fastapi")
logger.setLevel(logging.INFO)

# Stream handler for systemd journal
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter(LOG_FORMAT))

# Add handler to logger
logger.addHandler(handler)
