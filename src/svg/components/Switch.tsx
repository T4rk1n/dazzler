import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGSwitchElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Switch = (props: Props) => <switch {...enhanceProps(props)} />

export default React.memo(Switch);
