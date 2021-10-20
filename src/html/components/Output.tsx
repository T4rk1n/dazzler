import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.OutputHTMLAttributes<HTMLElement>, HTMLElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Output = (props: Props) => <output {...enhanceProps(props)} />

export default React.memo(Output);
