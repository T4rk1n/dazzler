import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.MeterHTMLAttributes<HTMLElement>, HTMLElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Meter = (props: Props) => <meter {...enhanceProps(props)} />

export default React.memo(Meter);
