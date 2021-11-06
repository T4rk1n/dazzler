from dazzler import Dazzler

app = Dazzler(__name__)

if __name__ == '__main__':
    app.start('--debug -v --port=8199 --reload')
