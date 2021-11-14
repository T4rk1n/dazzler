import React from 'react';
import IconPack from './IconPack';
import {DazzlerProps} from '../../../commons/js/types';

/**
 * Free Icon pack from: https://www.s-ings.com/typicons/
 *
 * :Pack: ``typcn``
 *
 * @example
 *
 *     icons.TypiconsPack()
 *     icons.Icon('typcn-globe')
 */
const TypiconsPack = (_: DazzlerProps) => {
    return (
        <IconPack
            name="typcn"
            url="https://cdnjs.cloudflare.com/ajax/libs/typicons/2.1.2/typicons.min.css"
        />
    );
};

TypiconsPack.defaultProps = {};

export default TypiconsPack;
