RUNNING=$(docker ps -q -f name=^jest-surrealdb&)
echo $RUNNING
if [ ! -z "$RUNNING" ]; then
  echo "Restarting jest-surrealdb"
  docker restart jest-surrealdb
else
  echo "Starting jest-surrealdb"
  docker run --rm -d -p 8000:8000 --name jest-surrealdb surrealdb/surrealdb:latest start --user root --pass root memory
fi
