import os
from functools import lru_cache

import certifi
from motor.motor_asyncio import AsyncIOMotorClient


@lru_cache(maxsize=1)
def get_client() -> AsyncIOMotorClient:
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        raise RuntimeError("MONGODB_URI is not set")
    return AsyncIOMotorClient(mongo_uri, tlsCAFile=certifi.where())


def get_db():
    client = get_client()
    return client.get_default_database()
