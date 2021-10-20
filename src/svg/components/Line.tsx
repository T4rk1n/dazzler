import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGLineElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Line = (props: Props) => <line {...enhanceProps(props)} />

export default React.memo(Line);
