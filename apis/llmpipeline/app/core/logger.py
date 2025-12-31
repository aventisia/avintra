import logging
import sys
import traceback

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

# Function to log exceptions with traceback details
def log_exception(logger, e, extra_msg="", error_data=None):
    tb = traceback.extract_tb(e.__traceback__)
    if tb:
        filename, lineno, func, text = tb[-1]
        logger.error(f"{extra_msg}{e} (File: {filename}, Line: {lineno})"
                     + (f", error: {error_data}" if error_data else ""))
    else:
        logger.error(f"{extra_msg}{e}" + (f", error: {error_data}" if error_data else ""))
