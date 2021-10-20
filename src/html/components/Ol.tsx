import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Ol = (props: Props) => <ol {...enhanceProps(props)} />

export default React.memo(Ol);
