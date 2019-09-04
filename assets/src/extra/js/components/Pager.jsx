import React from 'react';
import PropTypes from 'prop-types';
import {range, join} from 'ramda';

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



const Page = ({style, class_name, on_change, text, page}) => (
    <span
        style={style}
        className={class_name}
        onClick={() => on_change(page)}
    >
        {text || page}
    </span>
);

/**
 * Paging for dazzler apps.
 */
export default class Pager extends React.Component {
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

    componentWillMount() {
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

        const payload = {
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

    componentWillReceiveProps(props) {
        if (props.current_page !== this.state.current_page) {
            this.onChangePage(props.current_page);
        }
    }

    render() {
        const {current_page, pages, total_pages} = this.state;
        const {class_name, identity, page_style, page_class_name} = this.props;

        let pageCss = ['page'];
        if (page_class_name) {
            pageCss.push(page_class_name);
        }
        pageCss = join(' ', pageCss);

        return (
            <div
                className={class_name}
                id={identity}
            >
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
}

Pager.defaultProps = {
    current_page: 1,
    items_per_page: 10,
    pages_displayed: 10,
};

Pager.propTypes = {
    /**
     * The total items in the set.
     */
    total_items: PropTypes.number.isRequired,
    /**
     * The number of items a page contains.
     */
    items_per_page: PropTypes.number,

    identity: PropTypes.string,
    style: PropTypes.object,
    class_name: PropTypes.string,
    /**
     * Style for the page numbers.
     */
    page_style: PropTypes.object,
    /**
     * CSS class for the page numbers.
     */
    page_class_name: PropTypes.string,
    /**
     * The number of pages displayed by the pager.
     */
    pages_displayed: PropTypes.number,
    /**
     * Read only, the currently displayed pages numbers.
     */
    pages: PropTypes.array,
    /**
     * The current selected page.
     */
    current_page: PropTypes.number,
    /**
     * Set by total_items / items_per_page
     */
    total_pages: PropTypes.number,

    /**
     * The starting index of the current page
     * Can be used to slice data eg: data[start_offset: end_offset]
     */
    start_offset: PropTypes.number,
    /**
     * The end index of the current page.
     */
    end_offset: PropTypes.number,

    updateAspects: PropTypes.func,
};
