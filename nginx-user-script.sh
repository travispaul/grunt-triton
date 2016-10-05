# Deploy an example html5 page from initializr.com
/opt/local/bin/pkgin -y in unzip
cd /tmp
/opt/local/bin/curl 'http://www.initializr.com/builder?izr-responsive&jquerymin&h5bp-iecond&h5bp-chromeframe&h5bp-analytics&h5bp-favicon&h5bp-appletouchicons&modernizrrespond&h5bp-css&h5bp-csshelpers&h5bp-mediaqueryprint&izr-emptyscript' > izr.zip
/opt/local/bin/unzip izr.zip
mv initializr/* /home/admin/web/public/
rm -rf /tmp/*