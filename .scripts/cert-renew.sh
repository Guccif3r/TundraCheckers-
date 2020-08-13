#!/bin/bash
sudo certbot renew --webroot -w /opt/node/cert
sudo service nginx restart
