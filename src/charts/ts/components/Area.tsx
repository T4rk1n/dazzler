import React from 'react';
import {AreaProps} from 'recharts';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';
import {WithLabelListsProps} from '../chartProps';

type Props = Omit<AreaProps, HtmlOmittedProps> &
    WithLabelListsProps &
    DazzlerProps;

const Area = (_: Props) => <></>;

export default Area;
