import React from 'react';
import ReactDOM from 'react-dom';
import Renderer from './components/Renderer';
import {RenderOptions} from './types';

function render(
    {baseUrl, ping, ping_interval, retries}: RenderOptions,
    element: string
) {
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

// @ts-ignore
export {Renderer, render};
