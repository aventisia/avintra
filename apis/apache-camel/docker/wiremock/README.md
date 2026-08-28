# WireMock stubs for the Camel connector harness

This folder is mounted into the `mock-http` service defined in [docker-compose.yml](../../docker-compose.yml). WireMock serves stubs from `mappings/` and response bodies from `__files/`.

## Adding a stub

1. Create a JSON mapping file under `mappings/`, for example `mappings/echo.json`:

```json
{
  "request": {
    "method": "ANY",
    "urlPath": "/echo"
  },
  "response": {
    "status": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "jsonBody": {
      "received": true,
      "message": "hello"
    }
  }
}
```

2. Restart the mock service:

```bash
docker compose restart mock-http
```

The harness examples in the main README expect an `/echo` endpoint to be available at `http://localhost:8081`.
