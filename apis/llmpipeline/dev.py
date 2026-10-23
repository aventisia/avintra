import os

import uvicorn
from dotenv import load_dotenv

if __name__ == "__main__":
    load_dotenv(".env")
    load_dotenv(".env.local", override=True)
    port = os.getenv("UVICORN_PORT") or "4003"
    if not port.isdigit() or not 0 < int(port) < 65536:
        raise SystemExit(
            f'Invalid UVICORN_PORT "{port}": expected an integer between 1 and 65535.'
        )
    uvicorn.run("app.main:app", port=int(port), reload=True)
