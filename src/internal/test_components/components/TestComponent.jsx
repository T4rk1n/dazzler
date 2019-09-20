import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {isNil} from 'ramda';

/**
 * Test component with all supported props by dazzler.
 * Each prop are rendered with a selector for easy access.
 */
export default class TestComponent extends Component {
    render() {
        return (
            <div id={this.props.id}>
                <div className="array">
                    {this.props.array_prop &&
                        JSON.stringify(this.props.array_prop)}
                </div>
                <div className="bool">
                    {isNil(this.props.bool_prop)
                        ? ''
                        : this.props.bool_prop
                        ? 'True'
                        : 'False'}
                </div>
                <div className="number">{this.props.number_prop}</div>
                <div className="object">
                    {this.props.object_prop &&
                        JSON.stringify(this.props.object_prop)}
                </div>
                <div className="string">{this.props.string_prop}</div>
                <div className="symbol">{this.props.symbol_prop}</div>
                <div className="enum">{this.props.enum_prop}</div>
                <div className="union">{this.props.union_prop}</div>
                <div className="array_of">
                    {this.props.array_of_prop &&
                        JSON.stringify(this.props.array_of_prop)}
                </div>
                <div className="object_of">
                    {this.props.object_of_prop &&
                        JSON.stringify(this.props.object_of_prop)}
                </div>
                <div className="shape">
                    {this.props.shape_prop &&
                        JSON.stringify(this.props.shape_prop)}
                </div>
                <div className="required_string">
                    {this.props.required_string}
                </div>
            </div>
        );
    }
}

TestComponent.defaultProps = {
    string_with_default: 'Foo',
};

TestComponent.propTypes = {
    /**
     * The ID used to identify this component in the DOM.
     * Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
     */
    id: PropTypes.string,

    /**
     * Array props with
     */
    array_prop: PropTypes.array,
    bool_prop: PropTypes.bool,
    func_prop: PropTypes.func,
    number_prop: PropTypes.number,
    object_prop: PropTypes.object,
    string_prop: PropTypes.string,
    symbol_prop: PropTypes.symbol,
    any_prop: PropTypes.any,

    string_with_default: PropTypes.string,
    enum_prop: PropTypes.oneOf(['News', 'Photos']),

    // An object that could be one of many types
    union_prop: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    // An array of a certain type
    array_of_prop: PropTypes.arrayOf(PropTypes.number),

    // An object with property values of a certain type
    object_of_prop: PropTypes.objectOf(PropTypes.number),

    // An object taking on a particular shape
    shape_prop: PropTypes.shape({
        color: PropTypes.string,
        fontSize: PropTypes.number,
    }),
    required_string: PropTypes.string.isRequired,

    // These don't work good.
    nested_prop: PropTypes.shape({
        string_prop: PropTypes.string,
        nested_shape: PropTypes.shape({
            nested_array: PropTypes.arrayOf(
                PropTypes.shape({
                    nested_array_string: PropTypes.string,
                    nested_array_shape: PropTypes.shape({
                        prop1: PropTypes.number,
                        prop2: PropTypes.string,
                    }),
                })
            ),
            nested_shape_shape: PropTypes.shape({
                prop3: PropTypes.number,
                prop4: PropTypes.bool,
            }),
        }),
    }),

    array_of_array: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),

    children: PropTypes.node,
    identity: PropTypes.string,
    updateAspects: PropTypes.func,
};
