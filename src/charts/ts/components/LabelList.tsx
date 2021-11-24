import React from 'react';
import {LabelListProps} from 'recharts';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';

type Props = Omit<LabelListProps<any>, HtmlOmittedProps> & DazzlerProps;

const LabelList = (_: Props) => <></>;

export default LabelList;
