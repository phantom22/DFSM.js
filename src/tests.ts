/////////////////////////////////////////////////
// TESTS
/////////////////////////////////////////////////

// Accepts only strings that have an even number of zeroes and an odd number of ones.
const A000 = new DFSM(
    ["q0","q1","q2","q3"],
    ["0","1"],
    {
        q0:{0:"q1",1:"q2"},
        q1:{0:"q0",1:"q3"},
        q2:{0:"q3",1:"q0"},
        q3:{0:"q2",1:"q1"}
    },
    "q0",
    ["q2"],
    "(001+010+100+00+111)(001+010+100+00+111)*+1"
);

// Accepts only strings that either are empty or are formed by any pattern of alternating zeroes and ones. (ex. 0, 01, 010, 0101, ...)
const A001 = new DFSM(
    ["q0","q1","e"],
    ["0","1"],
    {
        q0: {
            0:"q1",
            1:"e"
        },
        q1: {
            0:"e",
            1:"q0"
        },
        e: {
            0:"e",
            1:"e"
        }
    },
    "q0",
    ["q0","q1"],
    "0+(01)*(0+Ɛ)"
);