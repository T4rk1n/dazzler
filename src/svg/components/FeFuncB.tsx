import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFEFuncBElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeFuncB = (props: Props) => <feFuncB {...enhanceProps(props)} />

export default React.memo(FeFuncB);
