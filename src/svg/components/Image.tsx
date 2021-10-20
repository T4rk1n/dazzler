import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGImageElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const Image = (props: Props) => <image {...enhanceProps(props)} />

export default React.memo(Image);
