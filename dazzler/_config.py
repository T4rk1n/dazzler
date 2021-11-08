from precept import Config, ConfigProperty, ConfigFormat, Nestable


class DazzlerConfig(Config):
    """Dazzler configuration"""

    app_title = ConfigProperty(
        default='Dazzler',
        comment='Name of the title of the index.'
    )

    host = ConfigProperty(
        default='127.0.0.1',
        comment='Host address',
        auto_global=True,
    )

    port = ConfigProperty(
        default=8150,
        comment='Port of the server',
        auto_global=True,
    )

    port_range = ConfigProperty(
        default=False,
        comment='Try to open the server starting from port until success.',
        config_type=bool,
    )

    version = ConfigProperty(
        default='0.1.0',
        comment='App version'
    )

    debug = ConfigProperty(
        default=False,
        config_type=bool,
        auto_global=True,
    )

    route_prefix = ConfigProperty(
        default='',
        comment='Route prefix for all dazzler related endpoints.',
    )

    static_folder = ConfigProperty(
        default='static',
        comment='Path relative to project folder where files will be served.',
    )

    static_prefix = ConfigProperty(
        default='/static',
        comment='Prefix for the static route'
    )

    secret_key = ConfigProperty(
        default='Please change me',
        comment='Secret key to use for signing sessions.',
        config_type=str,
    )

    pages_directory = ConfigProperty(
        default='pages',
        comment='Directory where pages will be automatically added to the app,'
                ' path is relative to the app file. '
                'Unsupported with electron',
        config_type=str,
    )

    class Session(Nestable):
        enable = ConfigProperty(
            config_type=bool,
            default=True
        )
        backend = ConfigProperty(
            comment='Type of session backend to use.'
                    ' Choices: File, Redis, PostgreSQL',
            default='File',
            config_type=str,
        )
        salt = ConfigProperty(
            config_type=str,
            comment='Salt for signing sessions ids.'
        )
        cookie_name = ConfigProperty(
            config_type=str,
            comment='Name of the session cookie.',
            default='sessionid'
        )
        duration = ConfigProperty(
            config_type=int,
            comment='Maximum duration of a session in seconds. '
                    '(Default=30 days)',
            default=2592000,
        )
        refresh_after = ConfigProperty(
            config_type=int,
            comment='Refresh the session when accessed '
                    'after this number of seconds. (Default=7 days)',
            default=604800
        )

    session: Session

    class Requirements(Nestable):
        prefer_external = ConfigProperty(
            default=False,
            config_type=bool,
            comment='Prefer serving external requirements when available'
        )
        external_scripts = ConfigProperty(
            default=[],
            config_type=list,
            comment='List of urls to include as script requirement.',
        )
        internal_scripts = ConfigProperty(
            default=[],
            config_type=list,
            comment='List of files to include as script requirement.',
        )
        external_styles = ConfigProperty(
            default=[],
            config_type=list,
            comment='List of urls to include as style requirement.'
        )
        internal_styles = ConfigProperty(
            default=[],
            config_type=list,
            comment='List of files to include as script requirement.',
        )
        static_directory = ConfigProperty(
            default='',
            config_type=str,
            comment='Where requirements files will be copied '
                    'to serve as static. If left empty, a user directory '
                    'will be used. '
        )
        static_url = ConfigProperty(
            default='/dazzler/requirements/static',
            config_type=str,
            comment='Url to use for the requirements static.'
        )
        clean_directory = ConfigProperty(
            default=True,
            config_type=bool,
            comment='Remove the requirements directory before copying '
                    'the new requirements.'
        )

    requirements: Requirements

    class Renderer(Nestable):
        retries = ConfigProperty(
            default=20,
            config_type=int,
            comment='Number of times it will try to reconnect '
                    'when the websocket connection is lost.'
        )
        ping = ConfigProperty(
            default=False,
            config_type=bool,
            comment='Enable to send a ping every interval to keep the '
                    'websocket connected if it didn\'t send data after '
                    'a delay. Some hosts providers will automatically closes '
                    'idling connection after a while.'
        )
        ping_interval = ConfigProperty(
            default=25.0,
            config_type=float,
            comment='Interval at which to send ping data.'
        )

    renderer: Renderer

    class Authentication(Nestable):
        enable = ConfigProperty(
            default=False,
            config_type=bool,
        )

        authenticator = ConfigProperty(
            config_type=str,
            comment='Path to an instance or subclass of '
                    '`dazzler.system.auth.Authenticator`',
            default=''
        )

        backend = ConfigProperty(
            config_type=str,
            comment='Path to an instance or subclass of '
                    '`dazzler.system.auth.AuthBackend`',
            default='',
        )

        class Login(Nestable):
            default_redirect = ConfigProperty(
                default='/',
                config_type=str,
                comment='Url to use by default if no next_url is available.'
            )
            page_title = ConfigProperty(
                default='Login',
                config_type=str,
                comment='Title of the login page'
            )
            page_url = ConfigProperty(
                default='/auth',
                comment='Url for the login page and related routes.'
            )
            form_header = ConfigProperty(
                default='Sign In',
                comment='Title of the login form.'
            )

        login: Login

        class Register(Nestable):
            enable = ConfigProperty(
                config_type=bool,
                default=True,
            )
            require_email = ConfigProperty(
                default=True,
                config_type=bool,
                comment='Require the user to provide an email '
                        'on the register page.'
            )
            page_name = ConfigProperty(
                default='register',
                config_type=str,
                comment='Name of the register page'
            )
            page_url = ConfigProperty(
                default='/auth/register'
            )
            custom_fields = ConfigProperty(
                default=[],
                config_type=list
            )
            next_url = ConfigProperty(
                default='/',
                comment='Redirect to after successfully creating a new user.'
            )
            reserved_usernames = ConfigProperty(
                config_type=list,
                default=[
                    'admin', 'administrator', 'staff',
                    'user', 'superuser', 'moderator',
                ],
                comment='Prevent registering with those usernames,'
                        ' case insensitive.'
            )
            username_pattern = ConfigProperty(
                config_type=str,
                default=r'[\w\d\-_]+',
                comment='Pattern to match the username input.'
            )

        register: Register

        class Admin(Nestable):
            enable = ConfigProperty(
                config_type=bool,
                default=False,
                comment='Enable the user admin page to manage role & users.'
            )
            page_url = ConfigProperty(
                config_type=str,
                default='/auth/admin',
                comment='Url for the admin page.'
            )
            page_ref = ConfigProperty(
                config_type=str,
                default='',
                comment='Must be set if enabled, path to an subclass of '
                        'UserAdminPage'
            )
            page_name = ConfigProperty(
                config_type=str,
                default='user_admin',
            )
            page_title = ConfigProperty(
                config_type=str,
                default='User Administration'
            )
            authorizations = ConfigProperty(
                config_type=list,
                default=['admin'],
                comment='Authorizations required to access the user admin page'
            )

        admin: Admin

    authentication: Authentication

    class Development(Nestable):
        reload = ConfigProperty(
            default=False,
            config_type=bool,
            auto_global=True,
            global_name='reload',
            comment='Enable hot reload when files used by the application'
                    ' are changed.'
        )

        reload_interval = ConfigProperty(
            default=0.5,
            config_type=float,
            comment='Interval at which the reload checks for file changes.'
        )

        reload_threshold = ConfigProperty(
            default=3.0,
            config_type=float,
            comment='Time to wait from first detected change '
                    'to actual reload.'
        )
        reload_delay = ConfigProperty(
            default=5.0,
            config_type=float,
            comment='Delay until the reloader start watching for changes.'
                    'Some libraries changes their files when first run.'
        )

    development: Development

    class Electron(Nestable):
        windows = ConfigProperty(
            default=[],
            config_type=list,
            comment='List of page names to create a window from.'
        )

        build_config_file = ConfigProperty(
            config_type=str,
            comment='Path to a file to use as electron-builder configuration.'
        )

        save_window_size = ConfigProperty(
            default=True,
            global_name='save_size',
            comment='Save the window size in the app local directory as json.'
        )

        icon = ConfigProperty(
            default='',
            config_type=str,
            comment='Path to the icon to use for the application. '
                    'For windows .ico works best when created '
                    'with multiple resolutions. Otherwise a PNG 512x512.'
        )

        asar = ConfigProperty(
            default=True,
            config_type=bool,
            comment='Package the application using asar, not recommended to'
                    'set to false by electron-builder but if you have '
                    'trouble with packaging extra files '
                    'you can disable this.'
        )

        class WindowSize(Nestable):
            """Default window size to use when first creating the window."""
            width = ConfigProperty(
                default=800,
                config_type=int,
                comment='Default width of the window.'
            )
            height = ConfigProperty(
                default=600,
                config_type=int,
                comment='Default height of the window.'
            )
            fullscreen = ConfigProperty(
                default=False,
                config_type=bool,
            )

        window_size: WindowSize

        class LoadingWindow(Nestable):
            enabled = ConfigProperty(
                default=False,
                config_type=bool,
                comment='Add a loading window while waiting for the server to '
                        'be available.'
            )

            html_file = ConfigProperty(
                default='',
                config_type=str,
                comment='Path to an html file to use as loading window.'
            )

            title = ConfigProperty(
                default='Loading',
                config_type=str,
            )

            header = ConfigProperty(
                default='',
                config_type=str,
                comment='Html to include on top of '
                        'the default loading spinner'
            )

            footer = ConfigProperty(
                default='<div>loading</div>',
                config_type=str,
            )

            class Options(Nestable):
                width = ConfigProperty(
                    default=300,
                    config_type=int,
                    comment='Width of the loading window.'
                )
                height = ConfigProperty(
                    default=400,
                    config_type=int,
                    comment='Height of the loading window.'
                )

                title = ConfigProperty(
                    config_type=str,
                    comment='Custom title to use for the loading window.'
                )

                fullscreen = ConfigProperty(
                    default=False,
                    config_type=bool,
                )
                center = ConfigProperty(
                    default=True,
                    config_type=bool,
                    comment='Center the loading window in the middle'
                            'of the screen.'
                )
                resizable = ConfigProperty(
                    default=False,
                    config_type=bool,
                )
                minimizable = ConfigProperty(
                    default=False,
                    config_type=bool,
                )
                maximizable = ConfigProperty(
                    default=False,
                    config_type=bool,
                )

                skip_taskbar = ConfigProperty(
                    default=True,
                    config_type=bool,
                    comment='Turn off to activate icon on the '
                            'taskbar with the loading window.'
                )
                frame = ConfigProperty(
                    default=False,
                    config_type=bool,
                    comment='Create a frameless window if disabled, '
                            'it has no toolbars.'
                )
                opacity = ConfigProperty(
                    default=1.0,
                    config_type=float,
                )
                transparent = ConfigProperty(
                    default=False,
                    config_type=bool,
                )

                title_bar_style = ConfigProperty(
                    default='default',
                    config_type=str,
                    comment='Options: default, hidden, '
                            'hiddenInset, customButtonsOnHover'
                )
                click_through = ConfigProperty(
                    default=True,
                    config_type=bool,
                )

            options: Options

        loading_window: LoadingWindow

        class Metadata(Nestable):
            """Target package.json attributes and should be defined."""

            app_name = ConfigProperty(
                default="",
                config_type=str,
                comment='App name to use when packaging. No spaces.'
            )
            description = ConfigProperty(
                default='',
                comment='Description of the application to use when packaging.'
            )
            homepage = ConfigProperty(
                default='',
                comment='Url for the project.'
                        ' (Required for NuGet or Linux Package URL)'
            )
            license = ConfigProperty(
                default='',
                comment='Name of the license. (Linux only)'
            )

            class Author(Nestable):
                name = ConfigProperty(default='')
                email = ConfigProperty(default='')

            author: Author

        metadata: Metadata

        class Builder(Nestable):
            app_id = ConfigProperty(
                comment='The appId to use for the build, '
                        'it is recommended to change.'
            )
            product_name = ConfigProperty(
                comment='Executable name that can contains spaces.'
                        ' Defaults to electron.metadata.name'
            )
            copyright = ConfigProperty(
                default='Copyright © year ${author}',
                comment='Copyright line to use in the installer.'
            )
            electron_version = ConfigProperty(
                default='^13.1.7',
                comment='Electron version to use for the build.'
            )
            electron_builder_version = ConfigProperty(
                default='^22.11.7',
                comment='Electron builder version to use for the build.'
            )

        builder: Builder

        class Target(Nestable):
            options_file = ConfigProperty(
                config_type=str,
                comment='json file to use as target options.'
            )

            arch = ConfigProperty(
                config_type=list,
                comment='List of architecture to target. Possible values: '
                        '“x64” | “ia32” | “armv7l” | “arm64”> | “x64” | '
                        '“ia32” | “armv7l” | “arm64”'
            )
            platform = ConfigProperty(
                config_type=str,
                comment='For multi platform targets like 7z and zip, specify '
                        'the platform (os) to configure. '
                        'One of: "win", "linux", "mac"'
            )

            class Linux(Nestable):
                maintainer = ConfigProperty(
                    config_type=str, comment='Defaults to author'
                )
                vendor = ConfigProperty(
                    config_type=str, comment='Defaults to author'
                )
                synopsis = ConfigProperty(
                    config_type=str, comment='Short description'
                )
                category = ConfigProperty(
                    config_type=str, comment='Category to use.'
                )
                executable_name = ConfigProperty(
                    config_type=str, comment='Default to `product_name`'
                )
                mime_types = ConfigProperty(config_type=list)

            linux: Linux

            class Win(Nestable):
                legal_trademarks = ConfigProperty(config_type=str)
                signing_hash_algorithms = ConfigProperty(config_type=list)
                certificate_file = ConfigProperty(config_type=str)
                certificate_password = ConfigProperty(config_type=str)
                certificate_subject_name = ConfigProperty(config_type=str)
                certificate_sha1 = ConfigProperty(config_type=str)
                additional_certificate_file = ConfigProperty(config_type=str)
                publisher_name = ConfigProperty(config_type=str)
                verify_update_code_signature = ConfigProperty(config_type=bool)
                requested_execution_level = ConfigProperty(config_type=str)

            win: Win

            class Mac(Nestable):
                entitlements = ConfigProperty(config_type=str)
                entitlements_inherit = ConfigProperty(config_type=str)
                provisioning_profile = ConfigProperty(config_type=str)
                type = ConfigProperty(config_type=str)
                binaries = ConfigProperty(config_type=str)
                hardened_runtime = ConfigProperty(config_type=bool)
                gatekeeper_assess = ConfigProperty(config_type=bool)

            mac: Mac

        target: Target

        class Publish(Nestable):
            provider = ConfigProperty(
                config_type=str, default='',
                comment='One of: "generic", "bintray", "github",'
                        ' "s3", "spaces", "snap"'
            )

            class Generic(Nestable):
                url = ConfigProperty(
                    config_type=str, default='',
                )
                channel = ConfigProperty(
                    config_type=str, default='latest'
                )
                use_multiple_range_request = ConfigProperty(
                    config_type=bool
                )

            generic: Generic

            class Bintray(Nestable):
                package = ConfigProperty(config_type=str, default='')
                repo = ConfigProperty(config_type=str, default='generic')
                owner = ConfigProperty(config_type=str)
                component = ConfigProperty(config_type=str)
                distribution = ConfigProperty(config_type=str)
                user = ConfigProperty(config_type=str, auto_environ=False)
                token = ConfigProperty(config_type=str)

            bintray: Bintray

            class Github(Nestable):
                repo = ConfigProperty(config_type=str)
                owner = ConfigProperty(config_type=str)
                v_prefixed_tag_name = ConfigProperty(
                    config_type=bool, default=True
                )
                host = ConfigProperty(
                    config_type=str, default='github.com'
                )
                protocol = ConfigProperty(config_type=str, default='https')
                token = ConfigProperty(config_type=str)
                private = ConfigProperty(config_type=bool)
                release_type = ConfigProperty(
                    config_type=str, default='draft'
                )

            github: Github

            class S3(Nestable):
                """Help"""
                bucket = ConfigProperty(config_type=str, default='')
                region = ConfigProperty(config_type=str)
                acl = ConfigProperty(config_type=str)
                storage_class = ConfigProperty(config_type=str)
                encryption = ConfigProperty(config_type=str)
                endpoint = ConfigProperty(config_type=str)
                channel = ConfigProperty(config_type=str)
                path = ConfigProperty(config_type=str, auto_environ=False)

            s3: S3

            class Spaces(Nestable):
                """Digital ocean, define DO_KEY_ID & DO_SECRET_KEY"""
                name = ConfigProperty(config_type=str)
                region = ConfigProperty(config_type=str)
                channel = ConfigProperty(config_type=str)
                path = ConfigProperty(config_type=str, auto_environ=False)
                acl = ConfigProperty(config_type=str)

            spaces: Spaces

            class Snap(Nestable):
                channels = ConfigProperty(config_type=list, default=['edge'])

            snap: Snap

        publish: Publish

    electron: Electron

    def __init__(self):
        super().__init__(root_name='dazzler', config_format=ConfigFormat.TOML)
