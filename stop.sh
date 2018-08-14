#! /bin/sh

AUTH_PID=`cat /var/run/auth.pid`
echo "$AUTH_PID"
kill $AUTH_PID
rm /var/run/auth.pid