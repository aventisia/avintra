from fastapi import Form

class TranscriptionRequest:
    def __init__(
        self,
        lang_code: str = Form("en"),
        use_gpu: bool = Form(False),
    ):
        self.lang_code = lang_code
        self.use_gpu = use_gpu
