import * as React from 'react';
import {XAxisProps} from 'recharts';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';
import {WithLabelsProps} from '../chartProps';

type Props = Omit<XAxisProps, HtmlOmittedProps> &
    WithLabelsProps &
    DazzlerProps;

const XAxis = (_: Props) => {
    return <></>;
};

export default XAxis;
