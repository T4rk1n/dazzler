#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function diff-docs() {
    cd ${DIR}
    tempdir=./_temp/
    mkdir ${tempdir}

    sphinx-apidoc -f -o ${tempdir} ../dazzler
    diff -r -q ${tempdir} ./api/
    code=$?

    if test ${code} -ne 0
    then
        echo Need to rebuild the docs
    fi

    rm -rf ${tempdir}
    return ${code}
}

diff-docs
