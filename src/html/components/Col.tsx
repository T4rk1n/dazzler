import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Col = (props: Props) => <col {...enhanceProps(props)} />

export default React.memo(Col);
