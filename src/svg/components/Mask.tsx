import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGMaskElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Mask = (props: Props) => <mask {...enhanceProps(props)} />

export default React.memo(Mask);
