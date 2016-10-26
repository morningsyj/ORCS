#!/usr/bin/env python

import sys
import datetime
import pymongo
import user

def query(start_time, duration):
    users = user.all();
    
    client = pymongo.MongoClient("mongodb://localhost:27071")
    db = client['orcs_db']
    coll = db.user_requests

    for u in users:
        ur = coll.find({username: u})
        print ur

    client.close()

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "add":
        client = pymongo.MongoClient("mongodb://localhost:27071")
        db = client['orcs_db']
        coll = db.user_requests
        offset = datetime.timedelta(-1)
        now = datetime.datetime.now()
        
        _id = coll.insert_one({"username": "test1", "start_time": now + offset, "end_time": -2 * offset, "duration": -1 * offset, "gpu": 0}).inserted_id
        print _id

        client.close()

if __name__ == "__main__":
    main()