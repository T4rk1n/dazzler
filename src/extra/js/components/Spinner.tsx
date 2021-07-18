import React from 'react';
import {DazzlerProps} from '../../../commons/js/types';

/**
 * Simple html/css spinner.
 */
const Spinner = (props: DazzlerProps) => {
    const {class_name, style, identity} = props;
    return <div id={identity} className={class_name} style={style} />;
};

export default Spinner;
