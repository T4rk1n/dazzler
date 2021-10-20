import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Td = (props: Props) => <td {...enhanceProps(props)} />

export default React.memo(Td);
