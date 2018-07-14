#!/bin/bash

./node_modules/.bin/knex migrate:latest --env tests

export ANANAS_TEST_DB=tests
./node_modules/mocha/bin/mocha --exit

if [ $? -eq 0 ]
then
  echo "Tests OK for SQLite"
else
  echo "Tests failed for database : SQLite" >&2
  exit;
fi

docker run -d --name ananas-tests -e POSTGRES_USER='ananas' -e POSTGRES_PASSWORD='ananas' -e POSTGRES_DB='ananas' -p 5434:5432 --rm postgres
./scripts/wait.sh localhost:5434
echo 'database ready'
sleep 2
ANANAS_TEST_DB=testsPostgres
./node_modules/.bin/knex migrate:latest --env testsPostgres
./node_modules/mocha/bin/mocha --exit

if [ $? -eq 0 ]
then
  echo "Tests OK for Postgres"
else
  echo "Tests failed for database : Postgres" >&2
  # docker container stop ananas-tests
  exit;
fi


docker container stop ananas-tests