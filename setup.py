from setuptools import setup

setup(
    extras_require={
        'redis': ['aioredis==1.3.1'],
        'electron': [
            'PyInstaller==4.5.1'
        ],
        'postgresql': ['aiopg==1.3.2']
    }
)
