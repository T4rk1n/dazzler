import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const H5 = (props: Props) => <h5 {...enhanceProps(props)} />

export default React.memo(H5);
