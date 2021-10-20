import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGDescElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Desc = (props: Props) => <desc {...enhanceProps(props)} />

export default React.memo(Desc);
