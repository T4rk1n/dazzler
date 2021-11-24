import React from 'react';
import {FunnelProps} from 'recharts';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';
import {WithCellsProps, WithLabelListsProps} from '../chartProps';

type Props = Omit<FunnelProps, HtmlOmittedProps> &
    WithLabelListsProps &
    WithCellsProps &
    DazzlerProps;

const Funnel = (_: Props) => <></>;

export default Funnel;
