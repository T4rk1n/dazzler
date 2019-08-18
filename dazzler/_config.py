from precept import Config, ConfigProperty, ConfigFormat, Nestable


class DazzlerConfig(Config):
    """Dazzler configurations"""

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

    static_includes = ConfigProperty(
        default='**/*.(js/css)',
        comment='Regex pattern to includes files as requirements inside the static folder.'
    )

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

    def __init__(self):
        super().__init__(root_name='dazzler', config_format=ConfigFormat.TOML)
