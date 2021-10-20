import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Div = (props: Props) => <div {...enhanceProps(props)} />

export default React.memo(Div);
