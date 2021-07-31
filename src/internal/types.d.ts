import {DazzlerProps} from '../commons/js/types';

type FooBarProps = {
    foo: string;
    bar: number;
};

type DefinedUnion = string | number | string[] | number[];
type DefinedEnum = 'foo' | 'bar';

export interface TypedComponentProps extends DazzlerProps {
    foobar?: FooBarProps;
    foobars?: FooBarProps[];

    num?: number;
    text?: string;
    boo?: boolean;
    children?: JSX.Element;
    arr?: [];
    arr_str?: string[];
    arr_num?: number[];
    arr_obj_lit?: {name: string}[];

    default_str?: string;
    default_required_str: string;
    default_num?: number;

    required_str: string;

    obj?: object;
    obj_lit?: {
        name: string;
    };

    enumeration?: 'foo' | 'bar';

    /** Docstring */
    str_with_comment?: string;

    union?: number | string;

    defined_union?: DefinedUnion;
    defined_enum?: DefinedEnum;
}
