import React from 'react';
import ReactDOM from 'react-dom';
import Renderer from './components/Renderer';

function render(baseUrl, element) {
    ReactDOM.render(<Renderer baseUrl={baseUrl}/>, element);
}

export {
    Renderer,
    render
}
