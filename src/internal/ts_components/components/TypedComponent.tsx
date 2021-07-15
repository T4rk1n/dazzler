import React, {useState} from 'react';
import {TypedComponentProps} from '../../types';

/**
 * Typed Component Docstring
 */
const TypedComponent = (props: TypedComponentProps) => {
    const {
        class_name,
        identity,
        style,
        num,
        text,
        children,
        arr,
        arr_str,
        arr_num,
        default_str,
        obj,
        obj_lit,
        required_str,
        default_required_str,
        enumeration,
    } = props;
    const [state] = useState(1);

    return (
        <div className={class_name} id={identity} style={style}>
            <div className='children'>{children}</div>
            <div className='state'>{state}</div>
            <div className='json-output'>
                {JSON.stringify({
                    num,
                    text,
                    arr,
                    arr_str,
                    arr_num,
                    default_str,
                    obj,
                    obj_lit,
                    required_str,
                    default_required_str,
                    enumeration
                })}
            </div>
        </div>
    );
};

TypedComponent.defaultProps = {
    default_str: 'default',
    default_required_str: 'default required',
    default_num: 3
};

export default TypedComponent;
