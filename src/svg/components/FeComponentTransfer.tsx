import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<React.SVGProps<SVGFEComponentTransferElement>, HtmlOmittedProps> & DazzlerHtmlProps;

const FeComponentTransfer = (props: Props) => <feComponentTransfer {...enhanceProps(props)} />

export default React.memo(FeComponentTransfer);
