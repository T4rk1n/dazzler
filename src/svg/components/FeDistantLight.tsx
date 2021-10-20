import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFEDistantLightElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeDistantLight = (props: Props) => <feDistantLight {...enhanceProps(props)} />

export default React.memo(FeDistantLight);
