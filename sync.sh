#!/bin/zsh

rsync -avhP --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.DS_Store'  \
    --exclude='node_modules' \
    --exclude='build' \
    --exclude='pnpm-lock.yaml' \
    --exclude='.vscode' \
    --exclude='logs' \
    --exclude='log.txt' \
    . matrix:~/matrix-dash