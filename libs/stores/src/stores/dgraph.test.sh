RUNNING=$(docker ps -q -f name=^jest-dgraph&)
echo $RUNNING
if [ ! -z "$RUNNING" ]; then
  docker restart jest-dgraph
else
  docker run --rm -d -p 8080:8080 -p 9080:9080 --name jest-dgraph dgraph/standalone:latest
fi
