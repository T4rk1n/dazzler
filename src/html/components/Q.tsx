import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Q = (props: Props) => <q {...enhanceProps(props)} />

export default React.memo(Q);
