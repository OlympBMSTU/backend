#! /bin/sh


if [ ! -f /var/run/auth.pid ]; then
    cd auth
    ./auth & echo $! >>/var/run/auth.pid
else
    echo "AUTH PID EXISTS"
fi
