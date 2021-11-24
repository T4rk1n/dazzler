import React from 'react';
import {TextProps} from 'recharts';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';

type Props = Omit<TextProps, HtmlOmittedProps> & DazzlerProps;

const Text = (_: Props) => <></>;

export default Text;
