import React from 'react';
import {ErrorBarProps} from 'recharts';
import {DazzlerProps, HtmlOmittedProps} from '../../../commons/js/types';

type Props = Omit<ErrorBarProps, HtmlOmittedProps> & DazzlerProps;

const ErrorBar = (_: Props) => <></>;

export default ErrorBar;
