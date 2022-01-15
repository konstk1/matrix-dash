#!/bin/zsh

rsync -avhP --exclude='node_modules' \
    --exclude='.git'  \
    --exclude='.DS_Store'  \
    --exclude='node_modules'  \
    --exclude='build'  \
    --exclude='package-lock.json'  \
    --exclude='.vscode'  \
    . matrix:~/matrix-dash