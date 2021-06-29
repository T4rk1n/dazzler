from dazzler import Dazzler

app = Dazzler(__name__)
app.config.pages_directory = 'page_dir'

if __name__ == '__main__':
    app.start('--debug')
