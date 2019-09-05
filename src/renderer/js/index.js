import React from 'react';
import ReactDOM from 'react-dom';
import Renderer from './components/Renderer';

function render({baseUrl, ping, ping_interval, retries}, element) {
    ReactDOM.render(
        <Renderer
            baseUrl={baseUrl}
            ping={ping}
            ping_interval={ping_interval}
            retries={retries}
        />,
        element
    );
}

export {Renderer, render};
