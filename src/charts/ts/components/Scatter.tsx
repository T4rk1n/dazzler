import React from 'react';
import {ScatterProps} from 'recharts';
import {HtmlOmittedProps} from '../../../commons/js/types';
import {
    WithCellsProps,
    WithErrorBarsProps,
    WithLabelListsProps,
} from '../chartProps';

type Props = Omit<ScatterProps, HtmlOmittedProps> &
    WithCellsProps &
    WithLabelListsProps &
    WithErrorBarsProps;

const Scatter = (_: Props) => <></>;

export default Scatter;
