import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.BlockquoteHTMLAttributes<HTMLElement>, HTMLElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Blockquote = (props: Props) => <blockquote {...enhanceProps(props)} />

export default React.memo(Blockquote);
