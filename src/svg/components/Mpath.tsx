import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Mpath = (props: Props) => <mpath {...enhanceProps(props)} />

export default React.memo(Mpath);
