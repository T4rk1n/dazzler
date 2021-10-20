import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFEGaussianBlurElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeGaussianBlur = (props: Props) => <feGaussianBlur {...enhanceProps(props)} />

export default React.memo(FeGaussianBlur);
