import React, {useCallback, useMemo} from 'react';
import {
    CommonPresetsProps,
    CommonStyleProps,
    DazzlerProps,
    PresetColor,
} from '../../../commons/js/types';
import {getCommonStyles, getPresetsClassNames} from 'commons';

type PanelProps = {
    /**
     * Title of the panel.
     */
    title?: JSX.Element;
    /**
     * Content of the panel under the title
     */
    content?: JSX.Element;
    /**
     * Allow to expand/hide content with a button on the right side of the
     * title that controls the expanded aspect.
     */
    expandable?: boolean;
    /**
     * Is the panel currently expanded?
     */
    expanded?: boolean;
    /**
     * Symbol to use as expand toggle when it is expanded.
     */
    expanded_symbol?: JSX.Element;
    /**
     * Symbol to use for the toggle symbol when panel content is hidden.
     */
    expandable_symbol?: JSX.Element;
    /**
     * Style of the title.
     */
    title_style?: object;
    /**
     * Class name to give to the title along with ``panel-title``.
     */
    title_class_name?: string;
    /**
     * Preset color to use as font color for the title.
     */
    title_color?: PresetColor;
    /**
     * Color preset for the background of the title.
     */
    title_background?: PresetColor;
    /**
     * Style of the content container.
     */
    content_style?: object;
    /**
     * Class name for the content container.
     */
    content_class_name?: string;
} & CommonStyleProps &
    CommonPresetsProps &
    DazzlerProps;

/**
 * Panel with optional expansion of content.
 *
 * :example:
 *
 * .. literalinclude:: ../../tests/components/pages/panel.py
 */
const Panel = (props: PanelProps) => {
    const {
        title,
        content,
        expanded,
        expandable,
        class_name,
        style,
        identity,
        updateAspects,
        expanded_symbol,
        expandable_symbol,
        title_style,
        title_class_name,
        title_color,
        title_background,
        content_style,
        content_class_name,
        ...rest
    } = props;
    const css = useMemo(() => {
        const classNames = [class_name];
        if (expandable) {
            classNames.push('expandable');
        }
        if (expanded) {
            classNames.push('expanded');
        }
        if (title_color) {
            classNames.push(`panel-title-color-${title_color}`);
        }
        if (title_background) {
            classNames.push(`panel-title-background-${title_background}`);
        }
        return getPresetsClassNames(rest, ...classNames);
    }, [rest, class_name, expandable, expanded, title_color, title_background]);
    const styling = useMemo(() => getCommonStyles(rest, style), [rest, style]);

    const toggleExpanded = useCallback(
        () => updateAspects({expanded: !expanded}),
        [expanded]
    );

    const [titleClassName, contentClassName] = useMemo(() => {
        const t = ['panel-title'],
            c = ['panel-content'];
        if (title_class_name) {
            t.push(title_class_name);
        }
        if (content_class_name) {
            c.push(content_class_name);
        }
        return [t.join(' '), c.join(' ')];
    }, [title_class_name, content_class_name]);

    return (
        <div className={css} style={styling} id={identity}>
            {title && (
                <div className={titleClassName} style={title_style}>
                    <div className="panel-title-content">{title}</div>
                    {expandable && (
                        <div className="panel-toggle" onClick={toggleExpanded}>
                            {expanded ? expanded_symbol : expandable_symbol}
                        </div>
                    )}
                </div>
            )}
            <div className={contentClassName} style={content_style}>
                {content}
            </div>
        </div>
    );
};

Panel.defaultProps = {
    expanded_symbol: '-',
    expandable_symbol: '+',
};

export default Panel;
