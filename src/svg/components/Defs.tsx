import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGDefsElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Defs = (props: Props) => <defs {...enhanceProps(props)} />

export default React.memo(Defs);
