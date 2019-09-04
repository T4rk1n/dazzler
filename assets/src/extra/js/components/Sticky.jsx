import React from 'react';
import PropTypes from 'prop-types';
import {mergeAll} from 'ramda';

/**
 * A shorthand component for a sticky div.
 */
export default class Sticky extends React.Component {
    render() {
        const {
            class_name,
            identity,
            style,
            children,
            top,
            left,
            right,
            bottom,
        } = this.props;
        const styles = mergeAll([style, {top, left, right, bottom}]);
        return (
            <div className={class_name} id={identity} style={styles}>
                {children}
            </div>
        );
    }
}

Sticky.defaultProps = {};

// TODO Add Sticky props descriptions

Sticky.propTypes = {
    children: PropTypes.node,
    top: PropTypes.string,
    left: PropTypes.string,
    right: PropTypes.string,
    bottom: PropTypes.string,

    class_name: PropTypes.string,
    style: PropTypes.object,
    identity: PropTypes.string,
};
