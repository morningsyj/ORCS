#!/usr/bin/env python

import sys
import datetime
import pymongo

def all():
    client = pymongo.MongoClient('mongodb://localhost:27017/')
    db = client['orcs_db']
    coll = db.users

    res = [p for p in coll.find({}, {"username": 1, "_id": 0})]

    client.close()

    return res


def main():
    print str(all())

if __name__ == "__main__":
    main()