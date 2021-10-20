import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Map = (props: Props) => <map {...enhanceProps(props)} />

export default React.memo(Map);
