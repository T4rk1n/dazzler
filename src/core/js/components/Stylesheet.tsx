import React, {useEffect} from 'react';
import {DazzlerProps} from '../../../commons/js/types';
import {loadCss} from 'commons';

type StylesheetProps = {
    /**
     * Stylesheet url to load.
     */
    uri: string;
    /**
     * Is the stylesheet loaded.
     */
    loaded?: boolean;
    /**
     * Time until it cancel the loading.
     */
    timeout?: number;
    /**
     * Error loading the stylesheet.
     */
    error?: string;
} & DazzlerProps;

/**
 * Load a stylesheet.
 */
const Stylesheet = (props: StylesheetProps) => {
    const {uri, loaded, timeout, updateAspects} = props;
    useEffect(() => {
        if (!loaded) {
            loadCss(uri, timeout)
                .then(() => updateAspects({loaded: true}))
                .catch((error) => updateAspects({error}));
        }
    }, [uri, loaded, timeout]);
    return <></>;
};

export default Stylesheet;
