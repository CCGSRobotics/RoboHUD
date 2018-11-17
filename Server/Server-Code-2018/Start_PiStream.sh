#!/bin/bash

/opt/vc/bin/raspivid -n -vf -hf -fps 15 -o - -w 800 -h 450 -t 0 | nc.traditional 192.168.100.72 5000
