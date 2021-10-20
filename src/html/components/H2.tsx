import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const H2 = (props: Props) => <h2 {...enhanceProps(props)} />

export default React.memo(H2);
