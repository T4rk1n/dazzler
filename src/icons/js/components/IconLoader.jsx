import React, {useEffect, useState, useCallback, useReducer} from 'react';
import PropTypes from 'prop-types';
import IconContext from '../IconContext';
import {concat} from 'ramda';
import {loadCss} from 'commons/utils';

const reducer = (state, action) => concat(state, [action]);

/**
 * Manager for loading icon packs
 *
 * Insert once in the layout, can load the packs from the props.
 * Manage the loaded packs so icons knows when to render.
 * ``IconPack``'s in the layout need this component.
 */
const IconLoader = (props) => {
    const {packs, children} = props;
    const [loadedPacks, dispatch] = useReducer(reducer, []);

    const addPack = (pack) => {
        dispatch(pack);
    };

    useEffect(() => {
        packs.forEach((pack) => loadCss(pack.url).then(() => addPack(pack)));
    }, [packs]);

    return (
        <IconContext.Provider value={{packs: loadedPacks, addPack}}>
            {children}
        </IconContext.Provider>
    );
};

IconLoader.defaultProps = {};

IconLoader.propTypes = {
    /**
     * Packs to automatically load when this component mounts.
     */
    packs: PropTypes.arrayOf(
        PropTypes.shape({
            url: PropTypes.string,
            name: PropTypes.string,
        })
    ),
    children: PropTypes.node,
    class_name: PropTypes.string,
    style: PropTypes.object,
    identity: PropTypes.string,
    updateAspects: PropTypes.func,
};

IconLoader.isContext = true;

export default IconLoader;
