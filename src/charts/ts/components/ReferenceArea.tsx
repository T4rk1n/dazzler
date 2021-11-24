import React from 'react';
import {ReferenceAreaProps} from 'recharts';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';
import {WithLabelsProps} from '../chartProps';

type Props = Omit<ReferenceAreaProps, HtmlOmittedProps> &
    WithLabelsProps &
    DazzlerProps;

const ReferenceArea = (_: Props) => <></>;

export default ReferenceArea;
