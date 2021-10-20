import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFEMergeNodeElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeMergeNode = (props: Props) => <feMergeNode {...enhanceProps(props)} />

export default React.memo(FeMergeNode);
