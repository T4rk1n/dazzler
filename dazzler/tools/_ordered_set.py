import collections


class OrderedSet(collections.abc.MutableSet):
    """
    Slow set to keep the order of unique elements in a list.
    """
    def __init__(self, *args):
        self._data = []
        for i in args:
            self.add(i)

    # pylint: disable=arguments-differ
    def add(self, value):
        if value not in self._data:
            self._data.append(value)

    def discard(self, value):
        self._data.remove(value)

    def __contains__(self, x):
        return x in self._data

    def __len__(self):
        return len(self._data)

    def __iter__(self):
        for i in self._data:
            yield i
