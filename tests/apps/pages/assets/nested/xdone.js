// Last to execute, put the results in a json div for assertion.
var element = document.createElement('div');
element.id = 'done-output';
element.innerHTML = JSON.stringify(loading_tests);
document.querySelector('body').appendChild(element);
