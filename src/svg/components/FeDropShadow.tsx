import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFEDropShadowElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeDropShadow = (props: Props) => <feDropShadow {...enhanceProps(props)} />

export default React.memo(FeDropShadow);
