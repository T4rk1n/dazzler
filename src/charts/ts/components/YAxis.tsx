import * as React from 'react';
import {YAxisProps} from 'recharts';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';
import {WithLabelsProps} from '../chartProps';

type Props = Omit<YAxisProps, HtmlOmittedProps> &
    WithLabelsProps &
    DazzlerProps;

const YAxis = (_: Props) => {
    return <></>;
};

export default YAxis;
