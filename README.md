## Descripción

Resolución del challenge para backend de Conexa.

Deployeado en: https://conexa-backend-challenge.onrender.com (Puede tardar unos 50 segundos en arrancar por el cold start que tiene el free tier)
Utilizando Render y MongoDB Atlas.

Swagger disponible en https://conexa-backend-challenge.onrender.com/api

## Implementación
Lo que interpreté del enunciado fue que la aplicación debia ser una, y debia tener como mínimo dos módulos, creados, por ejemplo, mediante nest generate module login. Habiendo dicho eso, la arquitectura que elegí fue la siguiente:

![alt text](https://github.com/santiagobiach/conexa-backend-challenge/blob/main/diagrams/Arquitectura.png?raw=true)

El módulo de Login es el único que tiene un controller, que acepta pedidos en:
- /auth/register
- /auth/login
- /auth/users

Luego de las validaciones pertinentes (Para garantizar que los body de las request son correctos), y de ser necesario realizar la autenticación (mediante una Auth Guard que se comunica con el módulo JWT), el Login Controller se comunicara con el Login Service. Este se encargara de verificar que, por ejemplo, este disponible el mail utilizado por un nuevo usuario. Se comunica tanto con el Database Service, que actua como una abstracción sobre la base de datos, y también con el Business Service, que es quien se encarga de manejar la lógica de negocio.

El módulo de configuración se encarga de otorgar las variables de entorno tanto al Módulo JWT cómo al módulo de Mongoose, que con quien se comunica el Database Service para tener acceso a la base de datos de MongoDB.

### Otra posible implementación
También era viable utilizar los llamados micro servicios de nest (NestFactory.createMicroservice<MicroserviceOptions>), y realizar el setup de un monorepo.

![alt text](https://github.com/santiagobiach/conexa-backend-challenge/blob/main/diagrams/Posible-Arquitectura.png?raw=true)

De esta forma, cada servicio estaria alojado en su propia aplicación, y se deberia tener un Gateway que se encargue de forwardear las requests que le llegan a los microservicios correspondientes, comunicandose con ellos mediante TCP, o por ejemplo RabbitMQ.

## Setup del proyecto

Copiar .env.example a .env

```bash
$ npm install
```

## Compilar y correr el proyecto

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
