// Dazzler start script, get params and start the renderer.
(function() {
    var script = document.getElementById('dazzler-script');
    function getParam(name, defaultValue) {
        return script.getAttribute('data-' + name) || defaultValue;
    }

    window.addEventListener('DOMContentLoaded', function() {
        dazzler_renderer.render(
            {
                baseUrl: getParam('base-url', ''),
                ping: getParam('ping'),
                ping_interval: parseInt(getParam('ping-interval', '25')),
                retries: parseInt(getParam('retries', '20')),
            },
            document.getElementById('dazzler-app')
        );
    });
})();
