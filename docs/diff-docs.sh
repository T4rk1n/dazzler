#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function diff-docs() {
    cd ${DIR}
    tempdir=./_temp/
    mkdir ${tempdir}

    sphinx-apidoc -q -f -M -d 6 -o ${tempdir} ../dazzler ../dazzler/components/svg ../dazzler/components/html ../dazzler/components/charts -H Reference
    diff -r -q ${tempdir} ./api/
    code=$?

    if test ${code} -ne 0
    then
        echo WARNING: Documentation is outdated.
        echo Rebuild the api docs with npm run build:docs
    fi

    rm -rf ${tempdir}
    return ${code}
}

diff-docs
