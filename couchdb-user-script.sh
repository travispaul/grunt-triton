# Install CouchDB
/opt/local/bin/pkgin -y in couchdb

# Get couchdb_password from metadata if exists, or set one.
if [[ $(mdata-get couchdb_password &>/dev/null)$? -eq "0" ]]; then
    COUCHDB_PW=$(mdata-get couchdb_password 2>/dev/null);
    mdata-put couchdb_pw ${COUCHDB_PW}
else
    COUCHDB_PW=$(od -An -N8 -x /dev/random | head -1 | tr -d ' ');
    mdata-put couchdb_pw ${COUCHDB_PW}
fi

# Get couchdb_bind_address or leave default
if [[ $(mdata-get couchdb_bind_address &>/dev/null)$? -eq "0" ]]; then
    COUCHDB_BIND=$(mdata-get couchdb_bind_address 2>/dev/null);
    /usr/bin/sed -i -e "s/;bind_address = 127\.0\.0\.1/bind_address = ${COUCHDB_BIND//\./\\.}/" /opt/local/etc/couchdb/local.ini
fi

# Set the password
echo "couchdb=$COUCHDB_PW" >> /opt/local/etc/couchdb/local.ini

svcadm enable -s pkgsrc/epmd
svcadm enable -s pkgsrc/couchdb