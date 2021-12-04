# Changelog

Versions follow [Semantic Versioning](https://www.semver.org)

## [0.10.0]
### Added

- 🍚 Add `core.Script`
- 🍚 Add `core.Stylesheet`
- 🍚 Add `charts` components.
- 🍚 Add `icons.FlagIconPack`

### Changed

- 🔨 Support context component with typescript.
- 🔨 Refactor icons to typescript.
- 🚧 Add common styling to Icon.

## [0.9.0]
### Added

- 🍚 Add html & svg components.
- 🍚 Add `core.Panel`.
- ✨ Add `@page.call` request binding.
- ✨ Authentication improvements:
  - Add register page.
  - Add user administration page.
  - Add page specific authorizations.
- ✨ Add `dazzler.contrib.postgresql` integrations:
  - `PostgresSessionBackend`
  - `PostgresAuthenticator`
  - `PostgresMiddleware`
  - `PostgresUserAdminPage`
- ✨ Add regex tie targets.
- ✨ Add `skip_initial` to Trigger to only bind after the initial render.
- 🍚 Add `delete_identity` aspect to core.ListBox

### Changed

- 🔌 Electron automatically create a window if the application contains only one page.
- 👣 Move redis session to `dazzler.contrib`.

### Fixed

- 🐛 Fix core.Dropdown multi with initial value.
- 🐛 Fix rendering of matrices of components.
- 🐛 Fix core.Box clicks.
- 🐛 Fix extra.Pager total_items changes and styling improvements.

## [0.8.1]
### Fixed

- 🐛 Fix external typescript component generation modules resolution.

## [0.8.0]
### Added

- 🍚 Add extra.ColorPicker
- 🍚 Add electron.WindowState
- 🔧 Add `port_range` config
- ✨ Add `once` parameter to bindings and ties.

## [0.7.0]
### Added

- ✨ Add Typescript component generation support.
- 🔧 Add `development.reload_delay` config, wait for a moment before starting reload watch.
- ✨ Add `electron` & `electron-build` commands to create desktop applications.
- 🍚 Add core.Text
- 🍚 Add core.Box
- 🍚 Add core.Checkbox
- 🍚 Add core.Switch

### Fixed

- 🐛 Fix hot reload for css files.
- 🐛 Fix code blocks in markdown.Markdown.
- 🏇 Bundles size optimized.
- 🚧 Set requirement load timeout to 30 seconds.
- 🚧 Decode generator error output.

### Changed

- 🔨 Refactor auth, calendar, core, extra to typescript.
- 🔨 Add common style/presets to core.Container, core.Grid, core.Link,
  core.TextArea, core.Table, core.Select, core.Modal, core.ListBox.
- 🔨 Add `grow_cell`, `equal_cell_width` to  core.Grid.

## [0.6.1]
### Fixed

- 🐛 Fix wsgi application setup parse configs.
- 🐛 Fix button disabled style.

### Changed

- 🔧 Add requirements `static_directory` & `static_url` config to serve static requirements via nginx.
- 🚧 Set session id cookie same site to true. 

## [0.6.0]
### Added

- ✨ Add create_task to binding context for long-running tasks.
- ✨ Automatically add pages defined in the `pages_directory` config. [#64](https://github.com/T4rk1n/dazzler/issues/64)
- 🚧 Various api shortcuts improvements.
- 🍚 core.Form styling improvements & hidden value support. [#79](https://github.com/T4rk1n/dazzler/issues/79)
- 🍚 New core.Container css classes: `center`, `hidden`.
- 🍚 Add maximum, minimum defaults to ProgressBar
- 🍚 Add default style to core.Table
- ✨ Add tie & transform API.

### Fixed

- 🐛 Fix binding key error when a state aspect has been set to undefined. [#57](https://github.com/T4rk1n/dazzler/issues/57)
- 🐛 Fix app_name from module filename.
- 🐛 Fix nested configs not updated when the values was not updated from default via precept 0.6.4.
- 🐛 Fix core.Dropdown initial value not rendered.

## [0.5.0]
### Added

- 🍚 Add Timestamp component. [#37](https://github.com/T4rk1n/dazzler/issues/37)
- 🍚 Add Toast component. [#60](https://github.com/T4rk1n/dazzler/issues/60)
- 🍚 Add PageMap component.
- 🍚 Add icons component package. [#17](https://github.com/T4rk1n/dazzler/issues/17)
- ✨ Add support for top level context provider in the js component api.
- ✨ Add integrity hash for bundled assets.

## [0.4.0]
### Added

- 🍚 Add Dropdown core component. [#5](https://github.com/T4rk1n/dazzler/issues/5)
- 🍚 Add TreeView extra component. [#15](https://github.com/T4rk1n/dazzler/issues/15)
- 🔨 Allow binding arguments to be strings. [#56](https://github.com/T4rk1n/dazzler/issues/56)
- 🔨 Allow lists as binding arguments. [#56](https://github.com/T4rk1n/dazzler/issues/56)
- 🔨 Add spinner to loading/reloading ui.

### Fixed

- 🐛 Fix rendering of list of object containing components. [#61](https://github.com/T4rk1n/dazzler/issues/61)

## [0.3.0]
### Added

- 🍚 Add ListBox Component. [#36](https://github.com/T4rk1n/dazzler/issues/36)
- 🍚 Add TextArea autosize. [#20](https://github.com/T4rk1n/dazzler/issues/20)
- ✨ Add regex support for binding trigger & states [#52](https://github.com/T4rk1n/dazzler/pull/52)

### Fixed

- 🐛 Fix page requirements url. [#35](https://github.com/T4rk1n/dazzler/issues/35)
- 🐛 Fix aspect docstrings. [#34](https://github.com/T4rk1n/dazzler/issues/34)
- 🐛 Fix page url with `/`. [#50](https://github.com/T4rk1n/dazzler/issues/50)

## [0.2.0]
### Added

- 🔥 Add hot reload. [#29](https://github.com/T4rk1n/dazzler/pull/29)
- 🍚 Add PopUp extra component. [#14](https://github.com/T4rk1n/dazzler/issues/14)
- 🔨 Connect websocket only if page has bindings. [#7](https://github.com/T4rk1n/dazzler/issues/7)
- 🔨 Generate react-docs metadata from dazzler command. [#4](https://github.com/T4rk1n/dazzler/issues/4)
- 🔧 Set default session duration to 30 days. [#22](https://github.com/T4rk1n/dazzler/issues/22)
- ✨ Add session refresh. [#22](https://github.com/T4rk1n/dazzler/issues/22)
- 🔨 Add app requirements scope. [#21](https://github.com/T4rk1n/dazzler/issues/21)

## [0.1.0]
### Added

- ✨ Add page route decorator with auto prefix.
- 🍚 Add auth components package.
- ✨ Add middleware support.
- ✨ Add Sessions.
- ✨ Add authentication for pages.

### Changed

- 🚧 Improve docstrings generation.
- 🔨 Rename `Container.n_clicks` -> `clicks`.

## [0.0.2]
### Fixed

- 🐛 Fix requirements directory permission issues.
- 🔒 Audit fix.

## [0.0.1]

- 🎉 Initial release
