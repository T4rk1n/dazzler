import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {format as formatter} from 'date-fns';

/**
 * Format a value according to the ``format`` prop.
 *
 * Syntax documentation https://date-fns.org/v2.15.0/docs/format
 */
const Timestamp = props => {
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

Timestamp.propTypes = {
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,

    format: PropTypes.string,

    locale: PropTypes.object,

    class_name: PropTypes.string,
    style: PropTypes.object,
    identity: PropTypes.string,
    updateAspects: PropTypes.func,
};

export default Timestamp;
