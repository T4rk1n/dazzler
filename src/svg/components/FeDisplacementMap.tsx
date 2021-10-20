import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFEDisplacementMapElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeDisplacementMap = (props: Props) => <feDisplacementMap {...enhanceProps(props)} />

export default React.memo(FeDisplacementMap);
