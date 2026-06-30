import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    SECRET_KEY=os.getenv("SECRET_KEY","change-me")
    PING_INTERVAL=int(os.getenv("PING_INTERVAL","30"))
