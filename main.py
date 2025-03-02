from fastapi import FastAPI

app = FastAPI()

@app.get("/api/")
def read_root():
    return {"message": "Hello, FastAPI!"}

@app.get("/api/hello/{name}/")
def hello_user(name: str):
    return {"Hello": name}

@app.post("/api/process/")
def process_data(payload: dict):
    return {"received_data": payload}