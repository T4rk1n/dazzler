import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFEFuncAElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeFuncA = (props: Props) => <feFuncA {...enhanceProps(props)} />

export default React.memo(FeFuncA);
