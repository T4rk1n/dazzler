# Changelog

Versions follow [Semantic Versioning](https://www.semver.org)

## [0.6.1]
### Fixed

- :bug: Fix wsgi application setup parse configs.
- :bug: Fix button disabled style.

### Changed

- :wrench: Add requirements `static_directory` & `static_url` config to serve static requirements via nginx.
- :construction: Set session id cookie same site to true. 

## [0.6.0]
### Added

- :sparkles: Add create_task to binding context for long-running tasks.
- :sparkles: Automatically add pages defined in the `pages_directory` config. [#64](https://github.com/T4rk1n/dazzler/issues/64)
- :construction: Various api shortcuts improvements.
- :rice: core.Form styling improvements & hidden value support. [#79](https://github.com/T4rk1n/dazzler/issues/79)
- :rice: New core.Container css classes: `center`, `hidden`.
- :rice: Add maximum, minimum defaults to ProgressBar
- :rice: Add default style to core.Table
- :sparkles: Add tie & transform API.

### Fixed

- :bug: Fix binding key error when a state aspect has been set to undefined. [#57](https://github.com/T4rk1n/dazzler/issues/57)
- :bug: Fix app_name from module filename.
- :bug: Fix nested configs not updated when the values was not updated from default via precept 0.6.4.
- :bug: Fix core.Dropdown initial value not rendered.

## [0.5.0]
### Added

- :rice: Add Timestamp component. [#37](https://github.com/T4rk1n/dazzler/issues/37)
- :rice: Add Toast component. [#60](https://github.com/T4rk1n/dazzler/issues/60)
- :rice: Add PageMap component.
- :rice: Add icons component package. [#17](https://github.com/T4rk1n/dazzler/issues/17)
- :sparkles: Add support for top level context provider in the js component api.
- :sparkles: Add integrity hash for bundled assets.

## [0.4.0]
### Added

- :rice: Add Dropdown core component. [#5](https://github.com/T4rk1n/dazzler/issues/5)
- :rice: Add TreeView extra component. [#15](https://github.com/T4rk1n/dazzler/issues/15)
- :hammer: Allow binding arguments to be strings. [#56](https://github.com/T4rk1n/dazzler/issues/56)
- :hammer: Allow lists as binding arguments. [#56](https://github.com/T4rk1n/dazzler/issues/56)
- :hammer: Add spinner to loading/reloading ui.

### Fixed

- :bug: Fix rendering of list of object containing components. [#61](https://github.com/T4rk1n/dazzler/issues/61)

## [0.3.0]
### Added

- :rice: Add ListBox Component. [#36](https://github.com/T4rk1n/dazzler/issues/36)
- :rice: Add TextArea autosize. [#20](https://github.com/T4rk1n/dazzler/issues/20)
- :sparkles: Add regex support for binding trigger & states [#52](https://github.com/T4rk1n/dazzler/pull/52)

### Fixed

- :bug: Fix page requirements url. [#35](https://github.com/T4rk1n/dazzler/issues/35)
- :bug: Fix aspect docstrings. [#34](https://github.com/T4rk1n/dazzler/issues/34)
- :bug: Fix page url with `/`. [#50](https://github.com/T4rk1n/dazzler/issues/50)

## [0.2.0]
### Added

- :hot_pepper: Add hot reload. [#29](https://github.com/T4rk1n/dazzler/pull/29)
- :rice: Add PopUp extra component. [#14](https://github.com/T4rk1n/dazzler/issues/14)
- :hammer: Connect websocket only if page has bindings. [#7](https://github.com/T4rk1n/dazzler/issues/7)
- :hammer: Generate react-docs metadata from dazzler command. [#4](https://github.com/T4rk1n/dazzler/issues/4)
- :wrench: Set default session duration to 30 days. [#22](https://github.com/T4rk1n/dazzler/issues/22)
- :sparkles: Add session refresh. [#22](https://github.com/T4rk1n/dazzler/issues/22)
- :hammer: Add app requirements scope. [#21](https://github.com/T4rk1n/dazzler/issues/21)

## [0.1.0]
### Added

- :sparkles: Add page route decorator with auto prefix.
- :rice: Add auth components package.
- :sparkles: Add middleware support.
- :sparkles: Add Sessions.
- :sparkles: Add authentication for pages.

### Changed

- :construction: Improve docstrings generation.
- :hammer: Rename `Container.n_clicks` -> `clicks`.

## [0.0.2]
### Fixed

- :bug: Fix requirements directory permission issues.
- :lock: Audit fix.

## [0.0.1]

:tada: Initial release
