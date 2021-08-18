import React, {useMemo} from 'react';
import {
    CommonPresetsProps,
    CommonStyleProps,
    DazzlerProps,
} from '../../../commons/js/types';
import {getCommonStyles, getPresetsClassNames} from 'commons';

type TextProps = {
    /**
     * Text to render
     */
    text?: string;
} & DazzlerProps &
    CommonStyleProps &
    CommonPresetsProps;

/**
 * Text component render as a span with common styling options.
 *
 * :CSS:
 *
 *      - ``dazzler-text``
 *
 * :example:
 *
 * .. code-block:: python
 *
 *      from dazzle.components.core import Text
 *
 *      text = Text('My text', font_size=20, font_weight='bold')
 */
const Text = (props: TextProps) => {
    const {text, class_name, style, identity, ...rest} = props;
    const css = useMemo(
        () => getPresetsClassNames(rest, class_name),
        [rest, class_name]
    );
    const styling = useMemo(() => getCommonStyles(rest, style), [rest, style]);
    return (
        <span id={identity} className={css} style={styling}>
            {text}
        </span>
    );
};

export default Text;
