import React, {useState} from 'react';
import Updater from './Updater';

import {RenderOptions} from '../types';

const Renderer = (props: RenderOptions) => {
    const [reloadKey, setReloadKey] = useState(1);

    // FIXME find where this is used and refactor/remove
    // @ts-ignore
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

export default Renderer;
