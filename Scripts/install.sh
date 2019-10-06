#!/usr/bin/bash
set -e
set -u
set -o pipefail

CLIENT=true;
SERVER=false;
HOST="";

while getopts 'h:o' OPTION; do
  case "$OPTION" in
    h)
      SERVER=true
      HOST=$OPTARG
      ;;
    o)
      CLIENT=false;
      SERVER=true;
      ;;
    ?)
      cat << EOM
This is the installation script for the CCGS RoboHUD GUI stack.
From here, you can install the client and/or the server.

Script usage:
$(basename "$0") [-h HOST] [-d DIRECTORY] [-o]
The -h option is the host to clone to, which is only needed if you are\
 installing the robot. The hostname you are most likely to encounter is\
 pi@192.168.100.1, but this may change over time.
The -o option only installs the server, which may be useful when creating a\
 new robot or updating the server, without the need to change the client.

The following code:
$(basename "$0") -h pi@192.168.100.1
Would install the code on both the robot and the client
EOM
      exit 1
      ;;
  esac
done
shift "$((OPTIND -1))"

if $CLIENT; then
  git clone https://github.com/CCGSRobotics/RoboHUD.git
  curl -o- -L https://yarnpkg.com/install.sh | bash
  cd RoboHUD/ && yarn
  cd ..
fi

if $SERVER; then
  if [[ -d "RoboHUD" ]]; then
    cd RoboHUD/
  else
    echo "$PWD"
  fi
  cd Server && yarn && cd ..
  scp -r Server/ "$HOST":
fi
