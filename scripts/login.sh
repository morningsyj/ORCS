#!/bin/bash

if [ $# -eq 0 ]
then
  echo "Please input the users to log in!"
  exit 0
fi

for p in "$@"
do
  user=${p}

  passwd -u ${user}
done
