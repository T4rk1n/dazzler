import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const H4 = (props: Props) => <h4 {...enhanceProps(props)} />

export default React.memo(H4);
