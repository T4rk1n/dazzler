import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFESpotLightElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeSpotLight = (props: Props) => <feSpotLight {...enhanceProps(props)} />

export default React.memo(FeSpotLight);
