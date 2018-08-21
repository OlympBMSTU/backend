#! /bin/sh
( cd auth && 
if [ ! -f /var/run/auth.pid ]; then
    cd auth
    npm start & echo $! >>/var/run/auth.pid
else
    echo "AUTH PID EXISTS"
fi
)