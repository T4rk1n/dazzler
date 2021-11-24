import * as React from 'react';
import {CartesianGridProps} from 'recharts';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';

type Props = Omit<CartesianGridProps, HtmlOmittedProps> & DazzlerProps;

const CartesianGrid = (_: Props) => <></>;

export default CartesianGrid;
