import React, {useEffect} from 'react';
import {DazzlerProps} from '../../../commons/js/types';
import {loadScript} from 'commons';

type ScriptProps = {
    /**
     * The script to load.
     */
    uri: string;
    loaded?: boolean;
    timeout?: number;
    error?: string;
} & DazzlerProps;

/**
 * Load a script when mounted, with loaded status update and error handling.
 */
const Script = (props: ScriptProps) => {
    const {uri, loaded, timeout, updateAspects} = props;
    useEffect(() => {
        if (!loaded) {
            loadScript(uri, timeout)
                .then(() => updateAspects({loaded: true}))
                .catch((error) => updateAspects({error}));
        }
    }, [uri, loaded, timeout]);

    return <></>;
};

Script.defaultProps = {
    timeout: 30000,
};

export default Script;
