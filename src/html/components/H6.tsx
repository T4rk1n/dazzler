import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const H6 = (props: Props) => <h6 {...enhanceProps(props)} />

export default React.memo(H6);
