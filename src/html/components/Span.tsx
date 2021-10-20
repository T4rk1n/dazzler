import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Span = (props: Props) => <span {...enhanceProps(props)} />

export default React.memo(Span);
