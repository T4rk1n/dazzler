import React from 'react';
import {BarProps} from 'recharts';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';
import {
    WithCellsProps,
    WithErrorBarsProps,
    WithLabelListsProps,
} from '../chartProps';

type Props = Omit<BarProps, 'shape' | HtmlOmittedProps> &
    WithLabelListsProps &
    WithCellsProps &
    WithErrorBarsProps &
    DazzlerProps;

const Bar = (_: Props) => <></>;

export default Bar;
