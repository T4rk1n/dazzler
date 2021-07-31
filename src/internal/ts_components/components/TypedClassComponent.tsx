import React from 'react';
import {TypedComponentProps} from '../../types';

const defProps = {
    default_required_str: 'default required',
    default_str: 'default',
    default_num: 3,
};

/**
 * Typed class component
 */
export default class TypedClassComponent extends React.Component<TypedComponentProps> {
    render() {
        const {
            children,
            class_name,
            style,
            identity,
            default_str,
            default_num,
        } = this.props;
        return (
            <div id={identity} className={class_name} style={style}>
                <div className="children">{children}</div>
                <div className="default_str">{default_str}</div>
                <div className="default_num">{default_num}</div>
            </div>
        );
    }

    static defaultProps = defProps;
}
