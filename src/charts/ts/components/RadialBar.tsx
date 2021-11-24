import React from 'react';
import {RadialBarProps} from 'recharts';
import {HtmlOmittedProps} from '../../../commons/js/types';
import {WithCellsProps, WithLabelListsProps} from '../chartProps';

type Props = Omit<RadialBarProps, HtmlOmittedProps> &
    WithCellsProps &
    WithLabelListsProps;

const RadialBar = (_: Props) => <></>;

export default RadialBar;
