[![Build Status](https://travis-ci.com/carpppa/sijoitussimulaattori-profile.svg?token=xQqx3oEyeT4LX1PHsDTx&branch=master)](https://travis-ci.com/carpppa/sijoitussimulaattori-profile)
# sijoitussimulaattori-profile

## Project setup instructions for vscode (recommended)

Install the following plugins:

- Prettier code formatter
  - automatic code formatting on save
  - settings from `.prettierrc`
  - add `"editor.formatOnSave": true` to `settings.json`
- EditorConfig
  - automatic formatting on save
  - settings from `.editorconfig`
- TypeScript Hero
  - automatic imports organizing for TypeScript
  - add the following to `settings.json`

```(json)
  "typescriptHero.imports.grouping": ["Modules", "Workspace", "Plains"],
  "typescriptHero.imports.organizeOnSave": true,
```

## Running the project

- Clean project: run `npm run build-ts`
- Development: run `npm run start:dev`

## Running tests

- Run `npm test`

## Enviroment

- NODE_ENV
  - `production | development | test`
- `LOG_LEVEL` : one of `winston` [log levels](https://github.com/winstonjs/winston#logging-levels) (optional, default value `info`)
- ENGINE_INTERVAL
  - Interval in ms between checking transactions. Defaults to 60000 if not set.
- STOCK_API_URL
  - Full url where stock-data can be fetched.
- `DATABASE_URL` && `WEB_API_KEY` can be found from firebase console -> project settings -> general.
  -  Database url will be of format `https://{public-facing-name}.firebaseio.com`
- Following will be found from firebase console -> project settings -> service accounts -> generate new private key.
  - TYPE
  - PROJECT_ID
  - PRIVATE_KEY_ID
  - PRIVATE_KEY
    - NOTE! This will be in form of '-----BEGIN PRIVATE KEY-----\nTHIS WILL BE KEY\n-----END PRIVATE KEY-----'. Grab only the THIS WILL BE KEY part.
  - CLIENT_EMAIL
  - CLIENT_ID
  - AUTH_URI
  - TOKEN_URI
  - AUTH_PROVIDER_X509_CERT_URL
  - CLIENT_X509_CERT_URL

## Dev-tools

- `npm run dev:create-user` or `npm run dev:create-user -- UID=my-custom-user-uid` Creates user to the database with given uid and prints authorization token for it.
- `npm run dev:generate-token` or `npm run generate:token -- UID=my-custom-user-uid` Generates authorization token for given uid.
- `npm run dev:generate-token` or `npm run generate:token -- UID=my-custom-user-uid` Removes user with given uid from the database. NOTE: At the moment does not remove any records for that user.

## Misc

### Authenticating requests

- Sender should obtain JWT token directly from firebase.
- Sender should include header `Authorization: Bearer <token>` to requests
- Receiver (this) will connect to firebase for validating tokens.
- If authorization is successful, property `identity` is added to requests.
- If authorization is unsuccessful, error will be returned.

### How this works

#### Profile-services

- It is just a traditional REST API serving basically a CRUD functionality for the App.
- See [server url]/api-docs

#### Transaction-engine

- Includes logic for completing transactions etc, making the simulator 'tick'.
- One time check is done by calling bin/transaction-engine-docheck.
  - Currently checks are scheduled using heroku scheduler.
  - TransactionEngine class includes method `start` which can be called if outside scheduling is not available. One can use this by uncommenting lines from index.ts.
- Cycle for completing transactions is following:
  - Find all pending transactions from firestore.
  - Find prices for all stocks present in these transactions.
  - Find which of pending transactions should be completed (based on prices)
  - Find which of pending transactions should be cancelled (based on expiration date)
  - Cancel/Fulfill transactions.
