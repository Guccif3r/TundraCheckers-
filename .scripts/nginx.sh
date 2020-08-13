#!/bin/bash
sudo cp .configs/forward.conf /etc/nginx/snippets/
sudo cp .configs/sslprm.conf /etc/nginx/snippets/
sudo cp .configs/nginx.conf /etc/nginx/sites-enabled/tundra
nginx -v
sudo nginx -t && sudo service nginx restart
