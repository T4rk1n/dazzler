import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFECompositeElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeComposite = (props: Props) => <feComposite {...enhanceProps(props)} />

export default React.memo(FeComposite);
