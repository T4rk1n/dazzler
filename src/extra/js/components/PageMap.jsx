import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';

/**
 * List of links to other page in the app.
 *
 * :CSS:
 *
 *     - ``dazzler-extra-page-map``
 */
const PageMap = props => {
    const {class_name, style, identity} = props;
    const [pageMap, setPageMap] = useState(null);

    useEffect(() => {
        fetch(`${window.dazzler_base_url}/dazzler/page-map`).then(rep =>
            rep.json().then(setPageMap)
        );
    }, []);

    return (
        <ul className={class_name} style={style} id={identity}>
            {pageMap &&
                pageMap.map(page => (
                    <li key={page.name}>
                        <a href={page.url}>{page.title}</a>
                    </li>
                ))}
        </ul>
    );
};

PageMap.defaultProps = {};

PageMap.propTypes = {
    class_name: PropTypes.string,
    style: PropTypes.object,
    identity: PropTypes.string,
    updateAspects: PropTypes.func,
};

export default PageMap;
