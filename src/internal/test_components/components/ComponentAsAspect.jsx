import React from 'react';
import PropTypes from 'prop-types';

export default class ComponentAsAspect extends React.Component {
    render() {
        const {identity, single, array, shape} = this.props;
        return (
            <div id={identity}>
                <div className="single">{single}</div>
                <div className="array">
                    {array.map((e, i) => (
                        <div key={i}>{e}</div>
                    ))}
                </div>
                <div className="shape">{shape.shaped}</div>
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

    /**
     *  Unique id for this component
     */
    identity: PropTypes.string,

    /**
     * Update aspects on the backend.
     */
    updateAspects: PropTypes.func,
};
