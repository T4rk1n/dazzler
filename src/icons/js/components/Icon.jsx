import React, {useContext, useMemo} from 'react';
import PropTypes from 'prop-types';
import {join, find, propEq} from 'ramda';
import IconContext from '../IconContext';

const Icon = (props) => {
    const {name, class_name, style, identity, icon_pack} = props;
    const context = useContext(IconContext);

    const pack = useMemo(() => {
        if (icon_pack) {
            return pack;
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

    if (!find(propEq('name', pack))(context.packs)) {
        return null;
    }

    return (
        <i
            className={join(' ', [name, class_name, pack])}
            style={style}
            id={identity}
        />
    );
};

Icon.defaultProps = {};

Icon.propTypes = {
    /**
     * Name of the icon to render, it will try to set the icon_pack prop from
     * the name if it's not provided. Split with ``-`` or empty space, the
     * first found will be the icon_pack. IE: For FoundIcon ``fi-[icon-name]``.
     */
    name: PropTypes.string.isRequired,
    /**
     * Correspond to the ``name`` proper of the icon_pack, most font icons
     * packages requires their pack name to be included in the class_name, as
     * such, this component will add it automatically from found or provided
     * icon pack name.
     */
    icon_pack: PropTypes.string,

    class_name: PropTypes.string,

    style: PropTypes.object,
    identity: PropTypes.string,
    updateAspects: PropTypes.func,
};

export default Icon;
