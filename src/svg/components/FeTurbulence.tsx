import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFETurbulenceElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeTurbulence = (props: Props) => <feTurbulence {...enhanceProps(props)} />

export default React.memo(FeTurbulence);
