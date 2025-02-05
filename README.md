## Descripción

Resolución del challenge para backend de Conexa.

## Setup del proyecto

Copiar .env.example a .env

```bash
$ npm install
```

## Compile and run the project

Para probar de forma local, levantar el container de MongoDB utilizando docker compose.

```bash
# development
$ docker compose up -d
```

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Correr las pruebas

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
