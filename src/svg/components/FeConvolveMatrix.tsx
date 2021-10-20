import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFEConvolveMatrixElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeConvolveMatrix = (props: Props) => <feConvolveMatrix {...enhanceProps(props)} />

export default React.memo(FeConvolveMatrix);
