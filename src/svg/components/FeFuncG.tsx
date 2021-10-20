import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFEFuncGElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeFuncG = (props: Props) => <feFuncG {...enhanceProps(props)} />

export default React.memo(FeFuncG);
