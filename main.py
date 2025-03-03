from fastapi import FastAPI

app = FastAPI(root_path="/api")

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}

@app.get("/hello/")
def hello_user():
    return {"message": f"Hello world!"}

@app.post("/process/")
def process_data(payload: dict):
    return {"received_data": payload}