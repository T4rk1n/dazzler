#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function build-docs() {
    cd ${DIR}
    make rst
    make html
}

build-docs
