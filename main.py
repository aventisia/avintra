from fastapi import FastAPI

app = FastAPI(root_path="/api")

@app.get("/hello/{name}")
def hello_user(name: str):
    return {"message": f"Hello, {name}!"}

@app.post("/process/")
def process_data(payload: dict):
    return {"received_data": payload}

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}