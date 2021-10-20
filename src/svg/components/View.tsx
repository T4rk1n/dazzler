import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGViewElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const View = (props: Props) => <view {...enhanceProps(props)} />

export default React.memo(View);
