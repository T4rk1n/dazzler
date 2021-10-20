import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Data = (props: Props) => <data {...enhanceProps(props)} />

export default React.memo(Data);
