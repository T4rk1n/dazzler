import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Colgroup = (props: Props) => <colgroup {...enhanceProps(props)} />

export default React.memo(Colgroup);
