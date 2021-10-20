import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const A = (props: Props) => <a {...enhanceProps(props)} />

export default React.memo(A);
