let a = [1, 2, 4, 6, 8, 12, 16];
let b = JSON.stringify(a);
console.log('b is' , b);
let c = JSON.parse(b);
console.log('c is',c);
let d = '[1,2,3,4,5,6,7,8]';
let e = JSON.parse(d);
console.log('d is', d, 'e is',e);