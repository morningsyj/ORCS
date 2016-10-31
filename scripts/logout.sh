#!/bin/bash

if [ $# -eq 0 ]
then
  echo "Please input the users to log out!"
  exit 0
fi

for p in "$@"
do
  user=${p}

  #res=$(ps aux | egrep -e "sshd: ${user}@" | egrep -v "grep")
  #echo "original: ${res}"

  printf "Log user ${user} out:\n"
  ps aux | egrep -e "^${user} " | while read -r line ; do
    printf "  ${line}\n"
    kill -9 $(echo ${line} | tr -s ' ' | cut -f 2 -d ' ')
  done

  passwd -l ${user}
done
