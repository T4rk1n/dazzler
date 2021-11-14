import React, {useEffect, useContext} from 'react';
import {loadCss} from 'commons';
import IconContext from '../IconContext';
import {DazzlerProps} from '../../../commons/js/types';

type Props = {name: string; url: string} & DazzlerProps;

/**
 * A pack of font icons to load.
 */
const IconPack = (props: Props) => {
    const {name, url} = props;
    const context = useContext(IconContext);

    useEffect(() => {
        loadCss(url).then(() => {
            context.addPack({name, url});
        });
    }, []);

    return <></>;
};

export default IconPack;
