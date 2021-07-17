import React, {useMemo} from 'react';
import {format as formatter} from 'date-fns';
import {TimestampProps} from '../types';

/**
 * Format a value according to the ``format`` prop.
 *
 * Syntax documentation https://date-fns.org/v2.15.0/docs/format
 */
const Timestamp = (props: TimestampProps) => {
    const {class_name, style, identity, value, format} = props;

    const formattedValue = useMemo(() => formatter(new Date(value), format), [
        value,
        format,
    ]);

    return (
        <span className={class_name} style={style} id={identity}>
            {formattedValue}
        </span>
    );
};

Timestamp.defaultProps = {};

export default Timestamp;
