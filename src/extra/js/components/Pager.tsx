import React from 'react';
import {range, join} from 'ramda';
import {PagerPageProps, PagerProps, PagerState} from '../types';

const startOffset = (page, itemPerPage) =>
    (page - 1) * (page > 1 ? itemPerPage : 0);

const endOffset = (start, itemPerPage, page, total, leftOver) =>
    page !== total
        ? start + itemPerPage
        : leftOver !== 0
        ? start + leftOver
        : start + itemPerPage;

const showList = (page, total, n) => {
    if (total > n) {
        const middle = n / 2;
        const first =
            page >= total - middle
                ? total - n + 1
                : page > middle
                ? page - middle
                : 1;
        const last = page < total - middle ? first + n : total + 1;
        return range(first, last);
    }
    return range(1, total + 1);
};

const Page = ({style, class_name, on_change, text, page}: PagerPageProps) => (
    <span style={style} className={class_name} onClick={() => on_change(page)}>
        {text || page}
    </span>
);

/**
 * Paging for dazzler apps.
 *
 * :CSS:
 *
 *     - ``dazzler-extra-pager``
 *     - ``page``
 */
export default class Pager extends React.Component<PagerProps, PagerState> {
    constructor(props) {
        super(props);
        this.state = {
            current_page: null,
            start_offset: null,
            end_offset: null,
            pages: [],
            total_pages: Math.ceil(props.total_items / props.items_per_page),
        };
        this.onChangePage = this.onChangePage.bind(this);
    }

    UNSAFE_componentWillMount() {
        this.onChangePage(this.props.current_page);
    }

    onChangePage(page) {
        const {
            items_per_page,
            total_items,
            updateAspects,
            pages_displayed,
        } = this.props;
        const {total_pages} = this.state;

        const start_offset = startOffset(page, items_per_page);
        const leftOver = total_items % items_per_page;

        const end_offset = endOffset(
            start_offset,
            items_per_page,
            page,
            total_pages,
            leftOver
        );

        const payload: PagerState = {
            current_page: page,
            start_offset: start_offset,
            end_offset: end_offset,
            pages: showList(page, total_pages, pages_displayed),
        };
        this.setState(payload);

        if (updateAspects) {
            if (this.state.total_pages !== this.props.total_pages) {
                payload.total_pages = this.state.total_pages;
            }
            updateAspects(payload);
        }
    }

    UNSAFE_componentWillReceiveProps(props) {
        if (props.current_page !== this.state.current_page) {
            this.onChangePage(props.current_page);
        }
    }

    render() {
        const {current_page, pages, total_pages} = this.state;
        const {class_name, identity, page_style, page_class_name} = this.props;

        const css: string[] = ['page'];
        if (page_class_name) {
            css.push(page_class_name);
        }
        const pageCss = join(' ', css);

        return (
            <div className={class_name} id={identity}>
                {current_page > 1 && (
                    <Page
                        page={1}
                        text={'first'}
                        style={page_style}
                        class_name={pageCss}
                        on_change={this.onChangePage}
                    />
                )}
                {current_page > 1 && (
                    <Page
                        page={current_page - 1}
                        text={'previous'}
                        style={page_style}
                        class_name={pageCss}
                        on_change={this.onChangePage}
                    />
                )}
                {pages.map(e => (
                    <Page
                        page={e}
                        key={`page-${e}`}
                        style={page_style}
                        class_name={pageCss}
                        on_change={this.onChangePage}
                    />
                ))}
                {current_page < total_pages && (
                    <Page
                        page={current_page + 1}
                        text={'next'}
                        style={page_style}
                        class_name={pageCss}
                        on_change={this.onChangePage}
                    />
                )}
                {current_page < total_pages && (
                    <Page
                        page={total_pages}
                        text={'last'}
                        style={page_style}
                        class_name={pageCss}
                        on_change={this.onChangePage}
                    />
                )}
            </div>
        );
    }
    static defaultProps = {
        current_page: 1,
        items_per_page: 10,
        pages_displayed: 10,
    };
}
