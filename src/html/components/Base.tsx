import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Base = (props: Props) => <base {...enhanceProps(props)} />

export default React.memo(Base);
