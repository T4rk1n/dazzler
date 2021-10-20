import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGLinearGradientElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const LinearGradient = (props: Props) => <linearGradient {...enhanceProps(props)} />

export default React.memo(LinearGradient);
