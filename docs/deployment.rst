.. _deployment:

Deployment Guide
================

As dazzler is based on `aiohttp <https://docs.aiohttp.org/en/stable/>`_,
it has the same deployments options found on the
`AIOHTTP Deployment Guide <https://docs.aiohttp.org/en/stable/deployment.html>`_
with some additional configurations needed for `Gunicorn`_ and serving the
static requirements with `Nginx`_.

Running with Gunicorn
---------------------

To ensure the application is setup properly,
you need to call :py:meth:`~.dazzler.Dazzler.application` in a factory method.

.. code-block:: python
    :caption: app.py

    from dazzler import Dazzler

    app = Dazzler(__name___)

    # Add pages, etc...

    async def app_factory():
        # If you need to add special configs or setup for production only
        # you can do that here.
        return await app.application()


Then you can call `Gunicorn`_ to start the wsgi application.

.. code-block:: bash

    gunicorn app:app_factory --worker-class aiohttp.GunicornWebWorker --bind 0.0.0.0:8080


Proxy thru Nginx
^^^^^^^^^^^^^^^^

Setup `Nginx`_ to proxy the `Gunicorn`_ bind address and forward the required
headers for websockets.

.. code-block:: nginx
    :caption: /etc/nginx/nginx.conf

    worker_processes 1;
    user nobody nogroup;

    events {
        worker_connections 1024;
    }

    http {
        map $http_upgrade $connection_upgrade {
            default upgrade;
            '' close;
        }

        server {
            listen 80 default_server;
            client_max_body_size 4G;

            # Main server routes
            location / {
                proxy_pass                          http://127.0.0.1:8080;
                proxy_set_header                    Host $host;
                proxy_set_header X-Forwarded-Host   $server_name;
                proxy_set_header X-Real-IP          $remote_addr;
                proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
            }

            # Websocket connections
            location ~ (/.+)/ws {
                proxy_pass                          http://127.0.0.1:8080$1/ws;
                proxy_http_version                  1.1;
                proxy_set_header X-Forwarded-Host   $server_name;
                proxy_set_header X-Real-IP          $remote_addr;
                proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
                proxy_set_header Upgrade            $http_upgrade;
                proxy_set_header Connection         $connection_upgrade;
                proxy_set_header Host               $host;

                # Websocket connections by default are closed if
                # no message from the client after 60s,
                # set this to a day instead
                proxy_read_timeout                  86400;
            }
        }
    }

.. seealso::
    - `Nginx websockets documentation <http://nginx.org/en/docs/http/websocket.html>`_

Serve the requirements static from nginx
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Since `Nginx`_ is better at handling static files,
we can set it to serve the requirements files instead
by setting the config ``requirements.static_directory`` and add
an Nginx location for the ``requirements.static_url``.

.. code-block:: toml
    :caption: dazzler.toml

    [requirements]
    static_directory = "/home/app/web/assets"
    static_url = "/dazzler/requirements/static"


Then in nginx configuration:

.. code-block:: nginx
    :caption: /etc/nginx/nginx.conf

    http {
        include mime.types;

        # ...

        server {

            # ...

            # Static requirements
            location /dazzler/requirements/static {
                alias /home/app/web/assets;
            }
        }
    }

.. _Nginx: https://www.nginx.com/
.. _Gunicorn: https://docs.gunicorn.org/en/stable/
