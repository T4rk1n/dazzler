import enum


class PresetSize(str, enum.Enum):
    tiny = 'tiny'
    small = 'small'
    medium = 'medium'
    large = 'large'
    larger = 'larger'
    x_large = 'x-large'
    xx_large = 'xx-large'

    def __str__(self):
        return self.value


class PresetColor(str, enum.Enum):
    primary = 'primary'
    primary_light = 'primary-light'
    primary_dark = 'primary-dark'

    secondary = 'secondary'
    secondary_light = 'secondary-light'
    secondary_dark = 'secondary-dark'

    tertiary = 'tertiary'
    tertiary_light = 'tertiary-light'
    tertiary_dark = 'tertiary-dark'

    danger = 'danger'
    danger_light = 'danger-light'
    danger_dark = 'danger-dark'

    warning = 'warning'
    warning_light = 'warning-light'
    warning_dark = 'warning-dark'

    success = 'success'
    success_light = 'success-light'
    success_dark = 'success-dark'

    neutral = 'neutral'
    neutral_light = 'neutral-light'
    neutral_dark = 'neutral-dark'

    dark = 'dark'
    dark_light = 'dark-light'
    dark_dark = 'dark-dark'

    darker = 'darker'
    darker_light = 'darker-light'
    darker_dark = 'darker-dark'

    def __str__(self):
        return self.value
