array = {
  xp: [],
  ficha: [],
};

function add(type, id) {
  if (type == "xp") {
    array.xp.push(id);
  } else if (type == "ficha") {
    array.ficha.push(id);
  }
}

function remove(type, id) {
  //array[type].splice(array[type].indexOf(id), 1);
  if (type == "xp") {
    array.xp.splice(array.xp.indexOf(id), 1);
  } else if (type == "ficha") {
    array.ficha.splice(array.ficha.indexOf(id), 1);
  }
}

function is(type, id) {
  if (type == "xp") {
    return array.xp.includes(id);
  } else if (type == "ficha") {
    return array.ficha.includes(id);
  }
}

module.exports = {
  add: add,
  remove: remove,
  is: is,
};
