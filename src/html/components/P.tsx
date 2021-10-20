import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const P = (props: Props) => <p {...enhanceProps(props)} />

export default React.memo(P);
