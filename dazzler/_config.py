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

    class Session(Nestable):
        enable = ConfigProperty(
            config_type=bool,
            default=True
        )
        backend = ConfigProperty(
            comment='Type of session backend to use. Choices: File, Redis',
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
            comment='Maximum duration of a session in seconds.',
            default=86400,
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
                    'a delay. Some hosts providers will automatically closes'
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
                    '`dazzler.system.auth.Authenticator',
            default=''
        )

        backend = ConfigProperty(
            config_type=str,
            comment='Path to an instance or subclass of '
                    '`dazzler.system.auth.AuthBackend',
            default='',
        )

    authentication: Authentication

    def __init__(self):
        super().__init__(root_name='dazzler', config_format=ConfigFormat.TOML)
