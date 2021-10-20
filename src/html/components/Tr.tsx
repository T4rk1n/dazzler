import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Tr = (props: Props) => <tr {...enhanceProps(props)} />

export default React.memo(Tr);
