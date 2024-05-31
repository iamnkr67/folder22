const add = (a, b) => {
  return a + b;
};

const ar = [1, 2, 3, 4, 5, 6];
let even = [];
let odd;

const array = (ar) => {
  ar.forEach((val) => {
    if (val % 2 == 0) {
      even.push(val);
    }
  });
  return even;
};

module.exports = {
  array,
  add,
};
