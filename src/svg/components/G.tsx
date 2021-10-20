import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGGElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const G = (props: Props) => <g {...enhanceProps(props)} />

export default React.memo(G);
