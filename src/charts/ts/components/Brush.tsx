import React from 'react';
import {BrushProps} from 'recharts';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';

type Props = Omit<BrushProps, HtmlOmittedProps> & DazzlerProps;

const Brush = (_: Props) => <></>;

export default Brush;
