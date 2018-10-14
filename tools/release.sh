#!/bin/bash

# Exit bash if any command fails
set -e

# Run clean install, production build and start
npm ci
npm run prod
