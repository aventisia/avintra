from fastapi import FastAPI

app = FastAPI()

@app.get("/api/")
def read_root():
    return {"message": "Hello, FastAPI!"}

@app.post("/api/process/")
def process_data(payload: dict):
    return {"received_data": payload}