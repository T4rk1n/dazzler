import React from 'react';
import IconPack from './IconPack';
import {DazzlerProps} from '../../../commons/js/types';

/**
 * Free icon pack from https://zurb.com/playground/foundation-icon-fonts-3
 *
 * :Pack: ``fi``
 *
 * :Example:
 *     .. code-block::python
 *
 *         icons.FoundIconPack()
 *         icons.Icon('fi-home')
 */
const FoundIconPack = (_: DazzlerProps) => {
    return (
        <IconPack
            name="fi"
            url="https://cdnjs.cloudflare.com/ajax/libs/foundicons/3.0.0/foundation-icons.min.css"
        />
    );
};

FoundIconPack.defaultProps = {};

export default FoundIconPack;
