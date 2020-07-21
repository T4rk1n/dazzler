import React from 'react';
import PropTypes from 'prop-types';

export default class ComponentAsAspect extends React.Component {
    render() {
        const {identity, single, array, shape, list_of_dict} = this.props;
        return (
            <div id={identity}>
                <div className="single">{single}</div>
                <div className="array">
                    {array.map((e, i) => (
                        <div key={i}>{e}</div>
                    ))}
                </div>
                <div className="shape">{shape.shaped}</div>
                <div className="list_of_dict">
                    {list_of_dict.map(e => (
                        <div key={e.value}>{e.label}</div>
                    ))}
                </div>
            </div>
        );
    }
}

ComponentAsAspect.defaultProps = {};

ComponentAsAspect.propTypes = {
    single: PropTypes.element,
    array: PropTypes.arrayOf(PropTypes.element),
    shape: PropTypes.shape({
        shaped: PropTypes.element,
    }),

    list_of_dict: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.node,
            value: PropTypes.any,
        })
    ),

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
