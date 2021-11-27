import React, {useContext, useMemo} from 'react';
import IconContext from '../IconContext';
import {
    CommonPresetsProps,
    CommonStyleProps,
    DazzlerProps,
} from '../../../commons/js/types';
import {getCommonStyles, getPresetsClassNames} from 'commons';

type Props = {
    /**
     * Name of the icon to render, it will try to set the icon_pack prop from
     * the name if it's not provided. Split with ``-`` or empty space, the
     * first found will be the icon_pack. IE: For FoundIcon ``fi-[icon-name]``.
     */
    name: string;
    /**
     * Correspond to the ``name`` proper of the icon_pack, most font icons
     * packages requires their pack name to be included in the class_name, as
     * such, this component will add it automatically from found or provided
     * icon pack name.
     */
    icon_pack?: string;
} & DazzlerProps &
    CommonPresetsProps &
    CommonStyleProps;

/**
 * Icon from a pack, prefix the name with the pack name.
 *
 * .. code-block:: python
 *
 *     icon = Icon('fi-home')
 */
const Icon = (props: Props) => {
    const {name, class_name, style, identity, icon_pack, ...rest} = props;
    const context = useContext(IconContext);

    const pack = useMemo(() => {
        if (icon_pack) {
            return icon_pack;
        }
        const split1 = name.split(' ');
        if (split1.length > 1) {
            return split1[0];
        }
        const split2 = name.split('-');
        if (split2.length > 1) {
            return split2[0];
        }
        return name;
    }, [icon_pack, name]);

    const css = useMemo(
        () => getPresetsClassNames(rest, class_name, name, pack),
        [rest, class_name, name, pack]
    );
    const styling = useMemo(() => getCommonStyles(rest, style), [rest, style]);

    if (!context.isLoaded(pack)) {
        return null;
    }

    return <i className={css} style={styling} id={identity} />;
};

Icon.defaultProps = {};

export default Icon;
