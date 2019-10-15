from setuptools import setup

setup(
    extras_requires={
        'redis': ['aioredis==1.3.0']
    }
)
