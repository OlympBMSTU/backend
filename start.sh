#! /bin/sh


if [ ! -f /var/run/auth.pid ]; then
    cd auth
    AUTH_PID=`exec ./auth &`
    echo $AUTH_PID >> /var/run/auth.pid
else
    echo "AUTH PID EXISTS"
fi
