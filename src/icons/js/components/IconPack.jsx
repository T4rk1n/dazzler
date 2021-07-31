import React, {useEffect, useContext} from 'react';
import PropTypes from 'prop-types';
import {loadCss} from 'commons/utils';
import IconContext from '../IconContext';

/**
 * A pack of font icons to load.
 */
const IconPack = (props) => {
    const {name, url} = props;
    const context = useContext(IconContext);

    useEffect(() => {
        loadCss(url).then(() => {
            context.addPack({name, url});
        });
    }, []);

    return <></>;
};

IconPack.defaultProps = {};

IconPack.propTypes = {
    /**
     * Name of the pack to include.
     */
    name: PropTypes.string.isRequired,
    /**
     * Url to load.
     */
    url: PropTypes.string.isRequired,

    children: PropTypes.node,
    class_name: PropTypes.string,
    style: PropTypes.object,
    identity: PropTypes.string,
    updateAspects: PropTypes.func,
};

export default IconPack;
