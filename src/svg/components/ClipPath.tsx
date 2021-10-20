import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGClipPathElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const ClipPath = (props: Props) => <clipPath {...enhanceProps(props)} />

export default React.memo(ClipPath);
