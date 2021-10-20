import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGPathElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Path = (props: Props) => <path {...enhanceProps(props)} />

export default React.memo(Path);
