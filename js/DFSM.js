class DFSM {
    /** A finite set of states. */
    Q;
    /** A finite set of input symbols called the alphabet. */
    Σ;
    /** A total function that computes the transitions between states δ : Q x Σ → Q represented by a table. */
    δ;
    /** An initial state q₀ ∈ Q. */
    q0;
    /** A finite set of accept states F ⊆ Q. */
    F;
    /** Array of all the sink nodes. */
    sink_nodes;
    /** Automata description. */
    description;
    /**
     * Constructs the specified deterministic finite-state machine.
     * @param {string[]} Q A finite set of states.
     * @param {string} Σ A finite set of input symbols called the alphabet.
     * @param {object} δ A total function that computes the transitions between states δ : Q x Σ → Q represented by a table.
     * @param {string} q0 An initial state q₀ ∈ Q.
     * @param {string[]} F A finite set of accept states F ⊆ Q.
     * @param {string} [description=""] Optional parameter, that simply helps to distinguish multiple automata.
     */
    constructor(Q, Σ, δ, q0, F, description = "") {
        this.Q = Array.from(new Set(Q));
        if (this.Q.length !== Q.length)
            console.warn("Removed duplicates from Q!");
        this.Σ = Array.from(new Set(Σ));
        if (this.Σ.length !== Σ.length)
            console.warn("Removed duplicates from Σ!");
        this.δ = δ;
        if (!this.Q.includes(q0))
            throw `${q0} is an invalid initial state because it doesn't belong to the FSM!`;
        this.q0 = q0;
        this.F = Array.from(new Set(F));
        if (this.F.length !== F.length)
            console.warn("Removed duplicates from F!");
        this.sink_nodes = [];
        this.description = description;
        // check for the completeness of δ while finding the sink_nodes.
        for (let i = 0; i < this.Q.length; i++) {
            let state = this.Q[i];
            let transitions = this.δ[state];
            if (typeof transitions === "undefined")
                throw `δ[${state}] is missing from the FSM transition table!`;
            let is_sink_node = true;
            for (let j = 0; j < this.Σ.length; j++) {
                let input_symbol = this.Σ[j], next_state = transitions[input_symbol];
                if (typeof next_state === "undefined")
                    throw `δ[${state}][${input_symbol}] is missing from the FSM transition table!`;
                else if (!this.Q.includes(next_state))
                    throw `δ[${state}][${input_symbol}] = ${next_state} is an invalid transition, because ${next_state} is a state that doesn't belong to the FSM!`;
                else if (next_state !== state)
                    is_sink_node = false; // if there is one transition from the current state to another one => it's not a sink node
            }
            if (is_sink_node)
                this.sink_nodes.push(state);
        }
    }
    /** If a given character belongs to the FSM alphabet, typecast it to Σ; throw an error otherwise. */
    #belongsToΣ(char) {
        for (let i = 0; i < this.Σ.length; i++)
            if (this.Σ[i] === char)
                return;
        throw `The character ${char} is not part of the alphabet!`;
    }
    /** If a given string is composed of characters that belong to the FSM alphabet, convert it to Σ[]; throw an error otherwise. */
    stringBelongsToΣ(string) {
        let o = [];
        for (let i = 0; i < string.length; i++) {
            let y = string[i];
            this.#belongsToΣ(y);
            o.push(y);
        }
        return o;
    }
    /** Given an input string, compute its output state. */
    compute(string) {
        let parsed = this.stringBelongsToΣ(string);
        let currentState = this.q0;
        for (let i = 0; i < parsed.length && !this.sink_nodes.includes(currentState); i++)
            currentState = this.δ[currentState][parsed[i]];
        return { final_state: currentState, is_accept_state: this.F.includes(currentState) };
    }
}
/////////////////////////////////////////////////
// TESTS
/////////////////////////////////////////////////
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
