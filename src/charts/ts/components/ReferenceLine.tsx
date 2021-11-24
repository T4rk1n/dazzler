import React from 'react';
import {ReferenceLineProps} from 'recharts';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';
import {WithLabelsProps} from '../chartProps';

type Props = Omit<ReferenceLineProps, HtmlOmittedProps> &
    WithLabelsProps &
    DazzlerProps;

const ReferenceLine = (_: Props) => <></>;

export default ReferenceLine;
