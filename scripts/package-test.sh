#!/bin/zsh

PACKAGE_VERSION=$(grep version package.json | sed 's/.*"version": "\(.*\)".*/\1/')

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}Packaging extension for version $PACKAGE_VERSION${NC}"
yarn package && zip compare-folders-$PACKAGE_VERSION.vsix.zip compare-folders-$PACKAGE_VERSION.vsix
echo "${GREEN}Packaged extension for version $PACKAGE_VERSION${NC}"