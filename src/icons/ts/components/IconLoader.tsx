import React, {useEffect, useReducer} from 'react';
import IconContext from '../IconContext';
import {assoc} from 'ramda';
import {loadCss} from 'commons';
import {DazzlerProps} from '../../../commons/js/types';

const reducer = (state: IconPackDict, pack: IconPackType) =>
    assoc(pack.name, pack, state);

type Props = {
    /**
     * Packs to automatically load when this component mounts.
     */
    packs?: {
        url: string;
        name: string;
    }[];
    children?: JSX.Element;
} & DazzlerProps;

/**
 * Manager for loading icon packs
 *
 * Insert once in the layout, can load the packs from the props.
 * Manage the loaded packs so icons knows when to render.
 * ``IconPack``'s in the layout need this component.
 */
const IconLoader = (props: Props) => {
    const {packs, children} = props;
    const [loadedPacks, dispatch] = useReducer(reducer, {});

    const addPack = (pack) => {
        dispatch(pack);
    };

    const isLoaded = (packName: string) => !!loadedPacks[packName];

    useEffect(() => {
        packs.forEach((pack) => loadCss(pack.url).then(() => addPack(pack)));
    }, [packs]);

    return (
        <IconContext.Provider value={{packs: loadedPacks, addPack, isLoaded}}>
            {children}
        </IconContext.Provider>
    );
};

IconLoader.defaultProps = {
    packs: [],
};

IconLoader.isContext = true;

export default IconLoader;
