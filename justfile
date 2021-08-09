dir := justfile_directory()
src := dir + "/src"
assets := dir + "/dazzler/assets"
components := dir + "/dazzler/components"

# Install all the dependencies
install:
    pip install -r requirements.txt
    pip install -r requirements-dev.txt
    pip install -e .
    npm install

# Build everything
build:
    npm run build

alias b := build

# Run all the tests, (10 minutes+)
test:
    pytest -ra --cov=dazzler

alias t := test

# Lint the js source code using eslint.
lint-js:
    npm run lint

# Run pylint & flake8 on dazzler & tests
lint-python:
    pylint dazzler tests
    flake8 dazzler tests

alias lp := lint-python

# Format the code using prettier
prettier:
    npm run format

# Test the js code using prettier.
prettier-test:
    npm run format:test

# Lint everything.
lint: lint-js lint-python prettier-test

alias l := lint

# Build the sphinx documentation.
docs:
    ./docs/build.sh

alias d := docs

# Diff the build-docs output against the source.
diff-docs:
    ./docs/diff-docs.sh

# Build and publish the package to pypi
publish: build
    rm -rf dist
    python setup.py sdist
    twine upload dist/*

watch:
    npm run watch

# Start the playground app with all the tests pages.
play:
    python tests/apps/playground.py

# Run the app at tests/electron/electron_app.py
electron:
    dazzler -c tests/electron/dazzler.toml electron tests/electron/electron_app.py

# Build the sample electron app.
electron-build TARGET="":
    dazzler -c tests/electron/dazzler.toml electron-build tests/electron/electron_app.py --target {{TARGET}}

# Generate a component package:
generate PACKAGE ARGS="":
    dazzler generate {{src}}/{{PACKAGE}}/js/components {{components}}/{{PACKAGE}} {{ARGS}}

# Analyze the bundles sizes
analyze-bundle:
    webpack --json > stats.json
    mv stats.json {{assets}}/dist
    npx webpack-bundle-analyzer {{assets}}/dist/stats.json

audit:
    npm audit

audit-fix:
    npm audit fix

bandit:
    bandit -r dazzler -s B107,B603,B404

analyze-security: audit bandit
