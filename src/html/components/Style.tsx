import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Style = (props: Props) => <style {...enhanceProps(props)} />

export default React.memo(Style);
