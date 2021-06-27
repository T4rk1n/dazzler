import React from 'react';
import PropTypes from 'prop-types';
import IconPack from './IconPack';

/**
 * Free Icon pack from "https://linearicons.com/free"
 *
 * :Pack: ``lnr``
 *
 * @example
 *
 *     icons.LinearIconPack(),
 *     icons.Icon('lnr-home')
 */
const LinearIconPack = () => {
    return (
        <IconPack
            name="lnr"
            url="https://cdn.linearicons.com/free/1.0.0/icon-font.min.css"
        />
    );
};

LinearIconPack.defaultProps = {};

LinearIconPack.propTypes = {
    class_name: PropTypes.string,
    style: PropTypes.object,
    identity: PropTypes.string,
    updateAspects: PropTypes.func,
};

export default LinearIconPack;
