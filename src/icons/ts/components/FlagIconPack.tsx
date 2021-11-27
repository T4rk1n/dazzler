import React from 'react';
import IconPack from './IconPack';
import {DazzlerProps} from '../../../commons/js/types';

/**
 * Free icon pack from https://github.com/lipis/flag-icons
 *
 * :Pack: ``flag-icon``
 *
 * :Example:
 *
 *     icons.FlagIconPack()
 *     icons.Icon('flag-icon flag-icon-ca')
 */
const FlagIconPack = (_: DazzlerProps) => {
    return (
        <IconPack
            name="flag-icon"
            url="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/4.1.5/css/flag-icons.min.css"
        />
    );
};

FlagIconPack.defaultProps = {};

export default FlagIconPack;
