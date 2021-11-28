import React from 'react';
import IconPack from './IconPack';
import {DazzlerProps} from '../../../commons/js/types';

/**
 * Free Icon pack from "https://linearicons.com/free"
 *
 * :Pack: ``lnr``
 *
 * :Example:
 *     .. code-block:: python
 *
 *         icons.LinearIconPack()
 *         icons.Icon('lnr-home')
 */
const LinearIconPack = (_: DazzlerProps) => {
    return (
        <IconPack
            name="lnr"
            url="https://cdn.linearicons.com/free/1.0.0/icon-font.min.css"
        />
    );
};

LinearIconPack.defaultProps = {};

export default LinearIconPack;
