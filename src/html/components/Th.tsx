import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Th = (props: Props) => <th {...enhanceProps(props)} />

export default React.memo(Th);
