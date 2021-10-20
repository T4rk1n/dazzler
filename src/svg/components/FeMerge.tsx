import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFEMergeElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeMerge = (props: Props) => <feMerge {...enhanceProps(props)} />

export default React.memo(FeMerge);
