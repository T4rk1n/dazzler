import React from 'react';
import IconPack from './IconPack';
import {DazzlerProps} from '../../../commons/js/types';

/**
 * Icon pack from https://useiconic.com/
 *
 * :Pack: ``oi``
 *
 * @example
 *
 *     icons.OpenIconicPack(),
 *     icons.Icon('oi-bug')
 */
const OpenIconicPack = (_: DazzlerProps) => {
    return (
        <IconPack
            name="oi"
            url="https://cdnjs.cloudflare.com/ajax/libs/open-iconic/1.1.1/font/css/open-iconic-bootstrap.min.css"
        />
    );
};

OpenIconicPack.defaultProps = {};

export default OpenIconicPack;
