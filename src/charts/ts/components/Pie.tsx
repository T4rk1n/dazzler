import React from 'react';
import {PieProps} from 'recharts';
import {HtmlOmittedProps} from '../../../commons/js/types';
import {WithCellsProps, WithLabelListsProps} from '../chartProps';

type Props = Omit<PieProps, HtmlOmittedProps> &
    WithLabelListsProps &
    WithCellsProps;

const Pie = (_: Props) => <></>;

export default Pie;
