import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Legend = (props: Props) => <legend {...enhanceProps(props)} />

export default React.memo(Legend);
