RUNNING=$(docker ps -w -f name=^jest-postgres&)
if [ ! -z "$RUNNING" ]; then
  docker restart jest-postgres
else
  docker run --rm -d -p 5432:5432 -e POSTGRES_PASSWORD=password --name jest-postgres postgres:alpine
fi