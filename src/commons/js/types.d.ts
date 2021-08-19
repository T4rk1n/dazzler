type Dict<T> = {[key: string]: T};
type StringDict = {[key: string]: string};
type AnyDict = Dict<any>;
type UpdateAspectFunc = (aspects: AnyDict) => void;

type PresetSize =
    | 'tiny'
    | 'small'
    | 'medium'
    | 'large'
    | 'larger'
    | 'x-large'
    | 'xx-large';

type PresetColor =
    | 'primary'
    | 'primary-light'
    | 'primary-dark'
    | 'secondary'
    | 'secondary-light'
    | 'secondary-dark'
    | 'tertiary'
    | 'tertiary-light'
    | 'tertiary-dark'
    | 'danger'
    | 'danger-light'
    | 'danger-dark'
    | 'warning'
    | 'warning-light'
    | 'warning-dark'
    | 'success'
    | 'success-light'
    | 'success-dark'
    | 'neutral'
    | 'neutral-light'
    | 'neutral-dark'
    | 'dark'
    | 'dark-light'
    | 'dark-dark'
    | 'darker'
    | 'darker-light'
    | 'darker-dark';

export interface DazzlerProps {
    /**
     * Class name automatically added by dazzler api with a prefix for the
     *  component library.
     * ie: core component Container become ``dazzler-core-container``.
     * When added on the component, the class names will be concatenated.
     */
    class_name?: string;
    /**
     * Base identifier for the component, if not provided, a random hash
     * will be generated.
     */
    identity?: string;
    /**
     * Style object for the top level wrapper of the component.
     */
    style?: object;
    /**
     * Added to dazzler components props, allow changes of aspects and
     * trigger ties & bindings.
     */
    updateAspects?: UpdateAspectFunc;
}

export interface CommonStyleProps {
    /**
     * Font color
     */
    color?: string;
    /**
     * Background color/image
     */
    background?: string;
    /**
     * Space around the content before the border
     */
    padding?: string | number;
    /**
     * Space after the element border
     */
    margin?: string | number;
    /**
     * Overflow the content and show a scrollbar.
     */
    overflow?: string;
    /**
     * Height of the component.
     */
    height?: string | number;
    /**
     * Maximum height before overflow.
     */
    max_height?: string | number;
    /**
     * Width of the component.
     */
    width?: string | number;
    /**
     * Maximum width before overflowing.
     */
    max_width?: string | number;
    /**
     * Font to use.
     */
    font_family?: string;
    /**
     * Size of the font.
     */
    font_size?: string | number;
    /**
     * Boldness
     */
    font_weight?: string | number;
    /**
     * Italic
     */
    font_style?: string;
    /**
     * Left center right.
     */
    text_align?: string;
    /**
     * Border around the component.
     */
    border?: string;
    /**
     * Round the corner of the component, needs a background or border.
     */
    border_radius?: string | number;
    /**
     * Cursor when the mouse is over the component.
     */
    cursor?: string;
    /**
     * Grow factor for flex item.
     */
    flex_grow?: number;
    /**
     * Shrink factor for flex item.
     */
    flex_shrink?: number;
    /**
     * Flex alignment for the component.
     */
    align_self?:
        | 'auto'
        | 'flex-start'
        | 'flex-end'
        | 'center'
        | 'baseline'
        | 'stretch';
    /**
     * CSS, How to display the component.
     */
    display?: string;
}

export interface CommonPresetsProps {
    /**
     * Round the edge of the container with borderRadius: 3px;
     */
    rounded?: boolean;
    /**
     * Apply default bordering with neutral dark grey,
     */
    bordered?: boolean;
    /**
     * Center the content in the middle of the container.
     */
    centered?: boolean;
    /**
     * Set the overflow content to scroll.
     */
    scrollable?: boolean;
    /**
     * Hide the component;
     */
    hidden?: boolean;
    /**
     * Do not allow for the text to be selected.
     */
    unselectable?: boolean;
    /**
     * Preset color to apply to the font.
     */
    preset_color?: PresetColor;
    /**
     * Preset color to apply to the background.
     */
    preset_background?: PresetColor;
    /**
     * Scale the size of the container using a preset.
     */
    preset_size?: PresetSize;
}
