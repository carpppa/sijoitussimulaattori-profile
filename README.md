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

- DEBUG
  - `TRUE | FALSE`
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

- `npm run generate:token` or `npm run generate:token -- UID=my-custom-user-uid` Generates/prints token which can be used for testing/calling endpoints behind authentication. Add generated token into authorization header. If user with that UID does not exists, creates one.
