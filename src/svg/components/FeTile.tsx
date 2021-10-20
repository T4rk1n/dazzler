import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFETileElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeTile = (props: Props) => <feTile {...enhanceProps(props)} />

export default React.memo(FeTile);
