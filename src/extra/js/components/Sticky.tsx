import React from 'react';
import {mergeAll} from 'ramda';
import {StickyProps} from '../types';

/**
 * A shorthand component for a sticky div.
 */
const Sticky = (props: StickyProps) => {
    const {class_name, identity, style, children, top, left, right, bottom} =
        props;
    const styles = mergeAll([style, {top, left, right, bottom}]);
    return (
        <div className={class_name} id={identity} style={styles}>
            {children}
        </div>
    );
};

export default Sticky;
