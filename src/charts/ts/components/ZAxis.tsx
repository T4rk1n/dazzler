import * as React from 'react';
import {ZAxisProps} from 'recharts';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';
import {WithLabelsProps} from '../chartProps';

type Props = Omit<ZAxisProps, HtmlOmittedProps> &
    WithLabelsProps &
    DazzlerProps;

const ZAxis = (_: Props) => {
    return <></>;
};

export default ZAxis;
