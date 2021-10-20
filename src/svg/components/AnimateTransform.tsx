import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const AnimateTransform = (props: Props) => <animateTransform {...enhanceProps(props)} />

export default React.memo(AnimateTransform);
