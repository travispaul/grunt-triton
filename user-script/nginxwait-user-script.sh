# Delay NGINX from starting to test waitForHTTP
/usr/sbin/svcadm disable svc:/pkgsrc/nginx:default
sleep 5
/usr/sbin/svcadm enable svc:/pkgsrc/nginx:default