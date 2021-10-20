import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFEFuncRElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeFuncR = (props: Props) => <feFuncR {...enhanceProps(props)} />

export default React.memo(FeFuncR);
