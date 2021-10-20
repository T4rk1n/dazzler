import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLPreElement>, HTMLPreElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Pre = (props: Props) => <pre {...enhanceProps(props)} />

export default React.memo(Pre);
