#!/usr/bin/env bash

conf_dir=$(dirname $(readlink -f $0))
cd $conf_dir

# copy conf file
# Listen on port 8080
# enable site
# restart apache
cp "010-raschietto.conf" "/etc/apache2/sites-available"
if [ $? -eq 0 ];
then
    # If ports.conf non contiene "Listen 8080"
    # then aggiungilo sulla riga dopo "Listen 80"
    # (che in genere c'è)
    grep -q -F  "Listen 8080" /etc/apache2/ports.conf\
    || sed -i -r 's/^(Listen 80)$/\1\nListen 8080/' /etc/apache2/ports.conf \
    && a2ensite "010-raschietto" \
    && apache2ctl restart
fi


