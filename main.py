from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}

@app.post("/process/")
def process_data(payload: dict):
    return {"received_data": payload}