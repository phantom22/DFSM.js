// Accepts only strings that have an even number of zeroes and an odd number of ones.
const A000 = new DFSM(["q0", "q1", "q2", "q3"], ["0", "1"], {
    q0: { 0: "q1", 1: "q2" },
    q1: { 0: "q0", 1: "q3" },
    q2: { 0: "q3", 1: "q0" },
    q3: { 0: "q2", 1: "q1" }
}, "q0", ["q2"], "(001+010+100+00+111)(001+010+100+00+111)*+1");
// Accepts only strings that either are empty or are formed by any pattern of alternating zeroes and ones. (ex. 0, 01, 010, 0101, ...)
const A001 = new DFSM(["q0", "q1", "e"], ["0", "1"], {
    q0: {
        0: "q1",
        1: "e"
    },
    q1: {
        0: "e",
        1: "q0"
    },
    e: {
        0: "e",
        1: "e"
    }
}, "q0", ["q0", "q1"], "0+(01)*(0+Ɛ)");
// Accepts only empty strings.
const A002 = new DFSM(["a", "e"], ["0", "1"], {
    a: {
        0: "e",
        1: "e"
    },
    e: {
        0: "e",
        1: 'e'
    }
}, "a", ["a"], "Ɛ");
// Accepts only strings that contain the word script.
const A003 = new DFSM(["_", "0", "1", "2", "3", "4", "5"], ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"], {
    _: [{ s: "0" }, "_"],
    0: [{ c: "1", s: "0" }, "_"],
    1: [{ r: "2", s: "0" }, "_"],
    2: [{ i: "3", s: "0" }, "_"],
    3: [{ p: "4", s: "0" }, "_"],
    4: [{ t: "5", s: "0" }, "_"],
    5: [{}, "5"],
}, "_", ["5"], "(a+z)*script(a+z)*");
