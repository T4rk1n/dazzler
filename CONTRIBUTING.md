# Contributing to Dazzler

## Getting Started

- Fork and clone the repo
- Create, activate & install dependencies
```
$ python -m venv venv
$ . venv/bin/activate
$ pip install -r requirements-dev.txt
```
- Install the package locally (optional, to generate the components)
`$ pip install -e .`

## Coding style

#### Linters

- [pylint](https://www.pylint.org/): 
`$ pylint dazzler`
- [flake8](http://flake8.pycqa.org/en/latest/): 
`$ flake8 dazzler`
- eslint: `$ npm run lint`

#### Formatter

Format js code with prettier:

`$ npm run format`

#### Commit messages

Prefix your commit messages with an emoji according to this list:

|   Commit type              | Emoji                                         |
|:---------------------------|:----------------------------------------------|
| Initial commit             | :tada: `:tada:`                               |
| Version tag                | :bookmark: `:bookmark:`                       |
| New feature                | :sparkles: `:sparkles:`                       |
| Bugfix                     | :bug: `:bug:`                                 |
| Metadata                   | :card_index: `:card_index:`                   |
| Documentation              | :books: `:books:`                             |
| Documenting source code    | :bulb: `:bulb:`                               |
| Performance                | :racehorse: `:racehorse:`                     |
| Cosmetic                   | :lipstick: `:lipstick:`                       |
| Tests                      | :rotating_light: `:rotating_light:`           |
| Adding a test              | :white_check_mark: `:white_check_mark:`       |
| General update             | :construction: `:construction:`               |
| Improve format/structure   | :art: `:art:`                                 |
| Move code                  | :feet: `:feet:`                               |
| Refactor code              | :hammer: `:hammer:`                           |
| DRY up code                | :camel: `:camel:`                             |
| Removing code/files        | :hocho: `:hocho:`                             |
| Continuous Integration     | :green_heart: `:green_heart:`                 |
| Security                   | :lock: `:lock:`                               |
| Upgrading dependencies     | :arrow_up: `:arrow_up:`                       |
| Downgrading dependencies   | :arrow_down: `:arrow_down:`                   |
| Lint                       | :shirt: `:shirt:`                             |
| Translation                | :alien: `:alien:`                             |
| Text                       | :pencil: `:pencil:`                           |
| Critical hotfix            | :ambulance: `:ambulance:`                     |
| Deploying stuff            | :rocket: `:rocket:`                           |
| Fixing on MacOS            | :apple: `:apple:`                             |
| Fixing on Linux            | :penguin: `:penguin:`                         |
| Fixing on Windows          | :checkered_flag: `:checkered_flag:`           |
| Adding CI build system     | :construction_worker: `:construction_worker:` |
| Analytics or tracking code | :chart_with_upwards_trend: `:chart_with_upwards_trend:` |
| Removing a dependency      | :heavy_minus_sign: `:heavy_minus_sign:`       |
| Adding a dependency        | :heavy_plus_sign: `:heavy_plus_sign:`         |
| Docker                     | :whale: `:whale:`                             |
| Configuration files        | :wrench: `:wrench:`                           |
| Bundles update             | :package: `:package:`                         |
| Merging branches           | :twisted_rightwards_arrows: `:twisted_rightwards_arrows:` |
| Bad code / need improv.    | :hankey: `:hankey:`                           |
| Reverting changes          | :rewind: `:rewind:`                           |
| Breaking changes           | :boom: `:boom:`                               |
| Code review changes        | :ok_hand: `:ok_hand:`                         |
| Accessibility              | :wheelchair: `:wheelchair:`                   |
| Move/rename repository     | :truck: `:truck:`                             |
| Add component(s)           | :rice: `:rice:`                               |
| Other                      | [Be creative](http://www.emoji-cheat-sheet.com/)  |

## Guides

### Adding features, components and bug fixes

- If you add a feature or fix a bug, it should also have a test.
- Features and component should have a standalone demo in `tests/apps/pages` or `tests/components/pages`.
- Bundle tests by package/system, components tests in `tests/components`.

### Upgrading a package vendors

- Get a new external url
- Download the url to vendors (eg: `cd dazzler/assets/vendors && wget https://unpkg.com/react@16.8.6/umd/react.production.min.js`)
- Ensure new filename has version in it for cache breaking, vendors are copied flat.
- Also download dev bundles to vendors if available.
- Change the requirements urls and paths.

### Adding a new component package

- Create a new directory in `src` for the components.
- Add webpack entrypoint.
- Add a package in `dazzler/components/package_name/__init__.py` (Copy core and change `_name`)
- Add a `build:meta` npm command.
- Add a `build:dazzler` npm command.

### Component creation

- Build the components: `$ npm run build`.
- Watch `$ npm run watch`.
- Components styles should be using css classes primarily.
- SCSS for styling, scoped with `library-name-component-name`.
- Spinal casing for css classes.
- extension `.jsx` for react components `js` otherwise.
- Include a docstring for every components/props.
- Include a test page in `tests/components/pages`.
- Include an acceptance test in `tests/components/test_[package_name].py`

### Release

- Build: `$ npm run build`.
- Build Python package `$ python setup.py sdist`.
- Upload `$ twine upload dist/dazzler.*`.
