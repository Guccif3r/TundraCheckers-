INST=ubuntu@tundra.infolek.ru
DST=/home/ubuntu/tundra

eval `ssh-agent`
ssh $INST "cd $DST && git pull && npm i && npm run build && npm run prod"
