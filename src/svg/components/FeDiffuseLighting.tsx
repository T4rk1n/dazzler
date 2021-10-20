import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFEDiffuseLightingElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeDiffuseLighting = (props: Props) => <feDiffuseLighting {...enhanceProps(props)} />

export default React.memo(FeDiffuseLighting);
