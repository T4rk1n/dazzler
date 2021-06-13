import React from 'react';
import PropTypes from 'prop-types';
import IconPack from './IconPack';

/**
 * Icon pack from https://useiconic.com/
 */
const OpenIconicPack = () => {
    return (
        <IconPack
            name="oi"
            url="https://cdnjs.cloudflare.com/ajax/libs/open-iconic/1.1.1/font/css/open-iconic-bootstrap.min.css"
        />
    );
};

OpenIconicPack.defaultProps = {};

OpenIconicPack.propTypes = {
    class_name: PropTypes.string,
    style: PropTypes.object,
    identity: PropTypes.string,
    updateAspects: PropTypes.func,
};

export default OpenIconicPack;
