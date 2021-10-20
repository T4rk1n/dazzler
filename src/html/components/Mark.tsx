import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Mark = (props: Props) => <mark {...enhanceProps(props)} />

export default React.memo(Mark);
