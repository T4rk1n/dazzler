import React, {useState} from 'react';
import Updater from './Updater';
import PropTypes from 'prop-types';

const Renderer = (props) => {
    const [reloadKey, setReloadKey] = useState(1);

    // FIXME find where this is used and refactor/remove
    window.dazzler_base_url = props.baseUrl;
    return (
        <div className="dazzler-renderer">
            <Updater
                {...props}
                key={`upd-${reloadKey}`}
                hotReload={() => setReloadKey(reloadKey + 1)}
            />
        </div>
    );
};

Renderer.propTypes = {
    baseUrl: PropTypes.string.isRequired,
    ping: PropTypes.bool,
    ping_interval: PropTypes.number,
    retries: PropTypes.number,
};


export default Renderer;
