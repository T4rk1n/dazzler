import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFEColorMatrixElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeColorMatrix = (props: Props) => <feColorMatrix {...enhanceProps(props)} />

export default React.memo(FeColorMatrix);
