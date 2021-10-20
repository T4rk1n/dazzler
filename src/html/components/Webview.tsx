import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Webview = (props: Props) => <webview {...enhanceProps(props)} />

export default React.memo(Webview);
