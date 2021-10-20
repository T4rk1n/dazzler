import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFEPointLightElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FePointLight = (props: Props) => <fePointLight {...enhanceProps(props)} />

export default React.memo(FePointLight);
