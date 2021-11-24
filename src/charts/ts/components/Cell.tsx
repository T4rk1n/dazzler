import React from 'react';
import {CellProps} from 'recharts';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';

type Props = Omit<CellProps, HtmlOmittedProps> & DazzlerProps;

const Cell = (_: Props) => <></>;

export default Cell;
