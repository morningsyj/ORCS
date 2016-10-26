#!/usr/bin/env python

import sys
import datetime
import user_request

def main():
    now = datetime.date.today()
    print str(now + datetime.timedelta(-3))
    print str(now + datetime.timedelta(0))
    print str(now + datetime.timedelta(3))


if __name__ == "__main__":
    main()