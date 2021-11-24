import React from 'react';
import {ReferenceDotProps} from 'recharts';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';
import {WithLabelsProps} from '../chartProps';

type Props = Omit<ReferenceDotProps, HtmlOmittedProps> &
    WithLabelsProps &
    DazzlerProps;

const ReferenceDot = (_: Props) => <></>;

export default ReferenceDot;
