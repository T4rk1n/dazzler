import sys


def is_compiled():
    return getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS')
