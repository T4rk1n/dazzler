import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFESpecularLightingElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeSpecularLighting = (props: Props) => <feSpecularLighting {...enhanceProps(props)} />

export default React.memo(FeSpecularLighting);
