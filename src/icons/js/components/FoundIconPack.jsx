import React from 'react';
import PropTypes from 'prop-types';
import IconPack from './IconPack';

/**
 * Free icon pack from https://zurb.com/playground/foundation-icon-fonts-3
 *
 * :Pack: ``typcn``
 *
 * @example
 *
 *     icons.FoundIconPack()
 *     icons.Icon('typcn-globe')
 */
const FoundIconPack = () => {
    return (
        <IconPack
            name="fi"
            url="https://cdnjs.cloudflare.com/ajax/libs/foundicons/3.0.0/foundation-icons.min.css"
        />
    );
};

FoundIconPack.defaultProps = {};

FoundIconPack.propTypes = {
    class_name: PropTypes.string,
    style: PropTypes.object,
    identity: PropTypes.string,
    updateAspects: PropTypes.func,
};

export default FoundIconPack;
