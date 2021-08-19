import enum


class PresetSize(str, enum.Enum):
    TINY = 'tiny'
    SMALL = 'small'
    MEDIUM = 'medium'
    LARGE = 'large'
    LARGER = 'larger'
    X_LARGE = 'x-large'
    XX_LARGE = 'xx-large'

    def __str__(self):
        return self.value


class PresetColor(str, enum.Enum):
    PRIMARY = 'primary'
    PRIMARY_LIGHT = 'primary-light'
    PRIMARY_DARK = 'primary-dark'

    SECONDARY = 'secondary'
    SECONDARY_LIGHT = 'secondary-light'
    SECONDARY_DARK = 'secondary-dark'

    TERTIARY = 'tertiary'
    TERTIARY_LIGHT = 'tertiary-light'
    TERTIARY_DARK = 'tertiary-dark'

    DANGER = 'danger'
    DANGER_LIGHT = 'danger-light'
    DANGER_DARK = 'danger-dark'

    WARNING = 'warning'
    WARNING_LIGHT = 'warning-light'
    WARNING_DARK = 'warning-dark'

    SUCCESS = 'success'
    SUCCESS_LIGHT = 'success-light'
    SUCCESS_DARK = 'success-dark'

    NEUTRAL = 'neutral'
    NEUTRAL_LIGHT = 'neutral-light'
    NEUTRAL_DARK = 'neutral-dark'

    DARK = 'dark'
    DARK_LIGHT = 'dark-light'
    DARK_DARK = 'dark-dark'

    DARKER = 'darker'
    DARKER_LIGHT = 'darker-light'
    DARKER_DARK = 'darker-dark'

    def __str__(self):
        return self.value
