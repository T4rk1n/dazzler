import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class DefaultProps extends Component {
    render() {
        const {id} = this.props;
        return (
            <div id={id}>
                {Object.entries(this.props).map((k, v) => (
                    <div id={`${id}-${k}`} key={`${id}-${k}`}>
                        {k}: {JSON.stringify(v)}
                    </div>
                ))}
            </div>
        );
    }
}

DefaultProps.defaultProps = {
    string_default: 'Default string',
    string_default_empty: '',
    number_default: 0.2666,
    number_default_empty: 0,
    array_default: [1, 2, 3],
    array_default_empty: [],
    object_default: {foo: 'bar'},
    object_default_empty: {},
};

DefaultProps.propTypes = {
    id: PropTypes.string,

    string_default: PropTypes.string,
    string_default_empty: PropTypes.string,

    number_default: PropTypes.number,
    number_default_empty: PropTypes.number,

    array_default: PropTypes.array,
    array_default_empty: PropTypes.array,

    object_default: PropTypes.object,
    object_default_empty: PropTypes.object,
};
