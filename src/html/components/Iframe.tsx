import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Iframe = (props: Props) => <iframe {...enhanceProps(props)} />

export default React.memo(Iframe);
