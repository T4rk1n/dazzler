import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    is,
    join,
    includes,
    concat,
    without,
    filter,
    any,
    values,
    indexBy,
    prop,
} from 'ramda';
import {LabelValueAny, LabelValueAnyList, StylableLabelValue} from '../types';
import {AnyDict, DazzlerProps} from '../../../commons/js/types';

type DropdownOptionsProps = StylableLabelValue & {
    onClick?: (value: LabelValueAny) => void;
    selected?: boolean;
};

type SelectedItemProps = {
    option: DropdownOptionsProps;
    onRemove: (value: LabelValueAny) => void;
};

type DDropdownProps = {
    /**
     * List of options to choose/search from.
     */
    options: StylableLabelValue[] | string[];

    /**
     * Currently selected value(s).
     */
    value?: string | any[] | number | object;

    /**
     * Allow multiple values to be chosen, the value become a list of values.
     */
    multi?: boolean;
    /**
     * If true, render an input
     */
    searchable?: boolean;
    /**
     * Value entered by user to search options.
     */
    search_value?: string;
    /**
     * Keys to filter on searching the options.
     *
     * - Leave empty for all props.
     * - Valid values types to search on are strings & arrays.
     * - Nested prop access with dot notation.
     */
    search_props?: string[];

    /**
     * Search the label along with the value.
     */
    search_label?: boolean;

    /**
     * Do not perform any search on the options from the frontend and instead
     * relies on binding the ``search_value`` to filter and set the
     * ``filtered_options`` aspect.
     */
    search_backend?: boolean;

    /**
     * Array of options that are filtered, set from backend with search
     */
    filtered_options?: StylableLabelValue[] | number[] | string[];

    /**
     * Is the dropdown currently open ?
     */
    opened?: boolean;

    /**
     * Label to use when no search results are available.
     */
    no_results_label?: JSX.Element;

    /**
     * Unicode character used as the toggle button.
     */
    toggle_symbol?: JSX.Element;

    /**
     * Make the menu scrollable.
     */
    scrollable?: boolean;

    scroll_max_size?: number;
} & DazzlerProps;

const DropdownOption = (props: DropdownOptionsProps) => {
    const {label, value, onClick, style, class_name, selected} = props;

    const className = useMemo(() => {
        const css = ['dropdown-item'];
        if (class_name) {
            css.push(class_name);
        }
        if (selected) {
            css.push('selected');
        }
        return join(' ', css);
    }, [class_name, selected]);

    return (
        <div
            className={className}
            onClick={(e) => {
                e.stopPropagation();
                onClick({value, label});
            }}
            style={style}
        >
            {label}
        </div>
    );
};

const SelectedItem = (props: SelectedItemProps) => {
    const {option, onRemove} = props;
    return (
        <div className="drop-selected-item">
            <div className="selected-label">{option.label}</div>
            <div
                className="selected-remover"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(option);
                }}
            >
                ✖
            </div>
        </div>
    );
};

/**
 * A dropdown to select options from a list.
 *
 * :CSS:
 *
 *     - ``dazzler-core-dropdown``
 *     - ``drop-toggle``
 *     - ``drop-symbol``
 *     - ``drop-container``
 *     - ``drop-item``
 *     - ``drop-selected-item``
 *     - ``selected``
 *     - ``selected-items``
 *     - ``selected-label``
 *     - ``selected-remover``
 *     - ``no-results``
 *     - ``search-content``
 *     - ``dropdown-search-input``
 *     - ``drop-controls``
 *
 * :example:
 *
 * .. code-block:: python
 *
 *      from dazzler.components.core import Dropdown
 *
 *      dropdown = Dropdown(
 *          {'label': 'Option 1', 'value': 1},
 *          {'label': 'Option 2', 'value': 2}
 *      )
 *
 */
const Dropdown = (props: DDropdownProps) => {
    const {
        options,
        class_name,
        style,
        identity,
        updateAspects,
        toggle_symbol,
        opened,
        multi,
        value,
        searchable,
        search_value,
        search_props,
        search_label,
        search_backend,
        filtered_options,
        no_results_label,
        scrollable,
        scroll_max_size,
    } = props;
    const mainRef = useRef(null);
    const containerRef = useRef(null);
    const toggleRef = useRef(null);
    const inputRef = useRef(null);
    const searchContentRef = useRef(null);
    const symbolRef = useRef(null);
    const selectedRef = useRef(null);

    // Keep them items with labels
    const [selectedItems, setSelectedItems] = useState<LabelValueAnyList>(
        (): any => {
            if (value) {
                const indexedOptions = indexBy(
                    prop('value'),
                    (options || []).map((e) =>
                        is(Object, e) ? e : {value: e, label: e}
                    )
                );
                if (is(Array, value)) {
                    return (value as Array<any>).map((v) => ({
                        value: v,
                        label: indexedOptions[v].label,
                    }));
                }
                if (is(String, value) || is(Number, value)) {
                    // @ts-ignore
                    return [{value, label: indexedOptions[value].label}];
                }
                if (is(Object, value)) {
                    return [value];
                }
            }
            return [];
        }
    );

    const containerStyle = useMemo(() => {
        const s: AnyDict = {};
        if (!opened) {
            return s;
        }

        // TODO orient top or bottom.

        const {height, width, top} = toggleRef.current.getBoundingClientRect();

        s.top = `${height}px`;
        s.width = `${width - 1}px`;

        if (scrollable) {
            if (scroll_max_size) {
                s.maxHeight = scroll_max_size;
            } else {
                s.maxHeight = window.innerHeight - top - height - 24;
            }
        }
        return s;
    }, [opened, selectedItems, scrollable, scroll_max_size]);

    const containerCss = useMemo(() => {
        const css = ['drop-container'];
        if (opened) {
            css.push('opened');
        }
        if (scrollable) {
            css.push('scrollable');
        }
        return join(' ', css);
    }, [opened, scrollable]);

    const onItemClick = (option) => {
        const {value: itemValue} = option;

        const payload: AnyDict = {opened: false};

        if (multi) {
            const v: any = value || [];
            if (includes(itemValue, v)) {
                payload.value = without([itemValue], v);
                setSelectedItems(without([option], selectedItems));
            } else {
                payload.value = concat(v, [itemValue]);
                setSelectedItems(concat(selectedItems, [option]));
            }
        } else {
            if (value === itemValue) {
                payload.value = null;
                setSelectedItems(without([option], selectedItems));
            } else {
                payload.value = itemValue;
                setSelectedItems([option]);
            }
        }
        updateAspects(payload);
    };

    // Search filtering
    useEffect(() => {
        if (search_backend) {
            return;
        }

        if (!search_value) {
            updateAspects({filtered_options: null});
            return;
        }

        const matcher = includes(search_value);

        updateAspects({
            filtered_options: filter((option: any) => {
                if (is(String, option)) {
                    return matcher(option);
                }
                if (is(Object, option)) {
                    let isOk = false;
                    if (is(Object, option.value)) {
                        if (search_props && search_props.length) {
                            // noinspection JSUnusedLocalSymbols
                            isOk = search_props.reduce((acc, prop) => {
                                if (acc) {
                                    return acc;
                                }
                                return matcher(option.value[prop]);
                            }, false);
                        } else {
                            isOk = any(matcher, values(option.value));
                        }
                    } else if (is(String, option.value)) {
                        isOk = matcher(option.value);
                    }
                    if (search_label) {
                        isOk = isOk || matcher(option.label);
                    }
                    return isOk;
                }
                return false;
            }, options),
        });
    }, [search_value, search_backend, options, search_props, search_label]);

    const onSearch = useCallback(
        (e) => {
            const payload: AnyDict = {search_value: e.target.value};
            if (!opened) {
                payload.opened = true;
            }
            updateAspects(payload);
        },
        [updateAspects, opened]
    );

    const optionsContent = useMemo(() => {
        const opts = filtered_options ? filtered_options : options;

        if (opts.length === 0) {
            return <div className="no-results">{no_results_label}</div>;
        }
        return opts.map((option, i) => {
            let selected;
            const key = `${identity}-${i}`;
            if (is(String, option)) {
                selected = includes(value, option);
                return (
                    <DropdownOption
                        label={option}
                        value={option}
                        key={key}
                        selected={selected}
                        onClick={onItemClick}
                    />
                );
            }
            selected = includes(value, option.value);
            return (
                <DropdownOption
                    {...option}
                    key={key}
                    selected={selected}
                    onClick={onItemClick}
                />
            );
        });
    }, [options, filtered_options, value, selectedItems]);

    const onToggle = useCallback(
        (event) => {
            const open = !opened;
            updateAspects({opened: open});
            event.stopPropagation();
            if (open) {
                if (searchable) {
                    inputRef.current.focus();
                }

                const autoClose = () => {
                    updateAspects({opened: false});
                    document.removeEventListener('click', autoClose);
                };

                document.addEventListener('click', autoClose);
            }
        },
        [opened, inputRef]
    );

    useEffect(() => {
        if (!value) {
            return;
        }
        const optionValues = options.map((o) => (is(Object, o) ? o.value : o));
        if (multi && value) {
            const includedValues = (value as any[]).filter((v) =>
                optionValues.includes(v)
            );
            if (includedValues.length !== (value as any[]).length) {
                updateAspects({
                    value: includedValues,
                });
                setSelectedItems(
                    selectedItems.filter((e) => optionValues.includes(e.value))
                );
            }
        } else {
            if (!optionValues.includes(value)) {
                updateAspects({value: null});
                setSelectedItems([]);
            }
        }
    }, [options]);

    const searchWidth = useMemo(() => {
        if (!searchContentRef.current) {
            return 9;
        }

        const toggleWidth = toggleRef.current.getBoundingClientRect().width;
        const searchWidth =
            searchContentRef.current.getBoundingClientRect().width + 9;
        const symbolWidth = symbolRef.current.getBoundingClientRect().width;
        const maxWidth = toggleWidth - symbolWidth - 16;

        if (searchWidth < maxWidth) {
            return searchWidth;
        }
        return maxWidth;
    }, [search_value, selectedItems, filtered_options]);

    return (
        <div className={class_name} style={style} id={identity} ref={mainRef}>
            <div className="drop-toggle" onClick={onToggle} ref={toggleRef}>
                <div className="drop-controls">
                    {searchable && (
                        <>
                            <div
                                className="search-content"
                                ref={searchContentRef}
                            >
                                {search_value}
                            </div>
                            <input
                                value={search_value}
                                onChange={onSearch}
                                className="dropdown-search-input"
                                ref={inputRef}
                                style={{width: searchWidth}}
                            />
                        </>
                    )}
                    <div className="selected-items" ref={selectedRef}>
                        {multi || searchable ? (
                            selectedItems.map((item, i) => (
                                <SelectedItem
                                    option={item}
                                    onRemove={onItemClick}
                                    key={`${identity}-selected-${i}`}
                                />
                            ))
                        ) : selectedItems.length ? (
                            <DropdownOption
                                {...selectedItems[0]}
                                selected
                                onClick={onToggle}
                            />
                        ) : null}
                    </div>
                </div>
                <span className="drop-symbol" ref={symbolRef}>
                    {toggle_symbol}
                </span>
            </div>
            <div
                className={containerCss}
                ref={containerRef}
                style={containerStyle}
            >
                {optionsContent}
            </div>
        </div>
    );
};

Dropdown.defaultProps = {
    toggle_symbol: '⏷',
    opened: false,
    filtered_options: null,
    search_value: '',
    no_results_label: 'No results!',
};

export default Dropdown;
