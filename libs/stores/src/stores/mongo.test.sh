RUNNING=$(docker ps -q -f name=^jest-mongodb&)
if [ ! -z "$RUNNING" ]; then
  docker restart jest-mongodb
else
  docker run --rm -d -p 27017:27017 --name jest-mongodb mongo:latest
fi
