import React, {useEffect, useState} from 'react';
import {DazzlerProps} from '../../../commons/js/types';

/**
 * List of links to other page in the app.
 *
 * :CSS:
 *
 *     - ``dazzler-extra-page-map``
 */
const PageMap = (props: DazzlerProps) => {
    const {class_name, style, identity} = props;
    const [pageMap, setPageMap] = useState(null);

    useEffect(() => {
        // @ts-ignore
        fetch(`${window.dazzler_base_url}/dazzler/page-map`).then((rep) =>
            rep.json().then(setPageMap)
        );
    }, []);

    return (
        <ul className={class_name} style={style} id={identity}>
            {pageMap &&
                pageMap.map((page) => (
                    <li key={page.name}>
                        <a href={page.url}>{page.title}</a>
                    </li>
                ))}
        </ul>
    );
};

PageMap.defaultProps = {};

export default PageMap;
