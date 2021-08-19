import React, {useMemo} from 'react';
import {
    CommonPresetsProps,
    CommonStyleProps,
    DazzlerProps,
} from '../../../commons/js/types';
import {getCommonStyles, getPresetsClassNames} from 'commons';

type LinkProps = {
    /**
     * The link destination.
     */
    href?: string;
    /**
     * Text/Component to show as link.
     */
    children?: JSX.Element;
    /**
     * Id of the html element, otherwise the identity is used.
     */
    id?: string;
    /**
     * Hovered description
     */
    title?: string;

    /**
     * Name of the page to redirect to if the href is not set.
     */
    page_name?: string;
} & CommonStyleProps &
    CommonPresetsProps &
    DazzlerProps;

/**
 * Link to external url or other dazzler page by name.
 *
 * :CSS: ``dazzler-core-link``
 */
const Link = (props: LinkProps) => {
    const {
        id,
        class_name,
        href,
        children,
        style,
        page_name,
        identity,
        ...rest
    } = props;
    const css = useMemo(
        () => getPresetsClassNames(rest, class_name),
        [rest, class_name]
    );
    const styling = useMemo(() => getCommonStyles(rest, style), [rest, style]);
    const url = useMemo(
        () =>
            page_name
                ? `${
                      // @ts-ignore
                      window.dazzler_base_url
                  }/dazzler/link?page=${encodeURIComponent(page_name)}`
                : href,
        [href, page_name]
    );
    return (
        <a id={id || identity} href={url} className={css} style={styling}>
            {children || page_name || url}
        </a>
    );
};

export default Link;
