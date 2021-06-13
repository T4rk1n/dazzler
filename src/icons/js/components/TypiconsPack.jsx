import React from 'react';
import PropTypes from 'prop-types';
import IconPack from './IconPack';

/**
 * Free Icon pack from: https://www.s-ings.com/typicons/
 *
 * Pack name: ``typcn``
 *
 * @example
 *
 *     icons.TypiconsPack()
 *     icons.Icon('typcn-globe')
 */
const TypiconsPack = () => {
    return (
        <IconPack
            name="typcn"
            url="https://cdnjs.cloudflare.com/ajax/libs/typicons/2.1.2/typicons.min.css"
        />
    );
};

TypiconsPack.defaultProps = {};

TypiconsPack.propTypes = {
    class_name: PropTypes.string,
    style: PropTypes.object,
    identity: PropTypes.string,
    updateAspects: PropTypes.func,
};

export default TypiconsPack;
