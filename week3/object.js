var roles = {
    'programmer' : 'egoing',
    'designer' : 'k8805',
    'manager' : 'hoya'
}

for (var n in roles) {
    console.log('object => ' + n + 'value =>' + eval(roles.n));
}