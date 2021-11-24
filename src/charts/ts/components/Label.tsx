import React from 'react';
import {LabelProps} from 'recharts';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';

type Props = Omit<LabelProps, HtmlOmittedProps> & DazzlerProps;

const Label = (_: Props) => <></>;

export default Label;
