import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGTextPathElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const TextPath = (props: Props) => <textPath {...enhanceProps(props)} />

export default React.memo(TextPath);
