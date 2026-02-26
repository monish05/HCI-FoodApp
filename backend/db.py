import os
import certifi
from pymongo import MongoClient

_client = None

def get_db():
    global _client
    if _client is None:
        uri = os.environ["MONGODB_URI"]

        # Atlas (mongodb+srv / mongodb://...tls=true) 才需要 TLS
        use_tls = uri.startswith("mongodb+srv://") or "tls=true" in uri.lower() or "ssl=true" in uri.lower()

        if use_tls:
            _client = MongoClient(
                uri,
                tls=True,
                tlsCAFile=certifi.where(),
                serverSelectionTimeoutMS=8000,
            )
        else:
            # local mongodb://127.0.0.1:27017 (no TLS)
            _client = MongoClient(uri, serverSelectionTimeoutMS=8000)

    return _client[os.environ.get("DB_NAME", "hci_foodapp")]