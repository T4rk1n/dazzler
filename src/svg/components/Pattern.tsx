import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGPatternElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Pattern = (props: Props) => <pattern {...enhanceProps(props)} />

export default React.memo(Pattern);
