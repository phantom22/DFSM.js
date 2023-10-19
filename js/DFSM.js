class DFSM {
    /**
     * Constructs the specified deterministic finite-state machine.
     * @param {string[]} Q A finite set of states.
     * @param {string} Σ A finite set of input symbols called the alphabet.
     * @param δ A total function that computes the transitions between states δ : Q x Σ → Q represented by a table.
     * @param {string} q0 An initial state q₀ ∈ Q.
     * @param {string[]} F A finite set of accept states F ⊆ Q.
     */
    constructor(Q, Σ, δ, q0, F) {
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
        state_loop: for (let i = 0; i < this.Q.length; i++) {
            let state = this.Q[i];
            let transitions = this.δ[state];
            if (typeof transitions === "undefined")
                throw `δ[${state}] is missing from the FSM transition table!`;
            for (let j = 0; j < this.Σ.length; j++) {
                let input_symbol = this.Σ[j], next_state = transitions[input_symbol];
                if (typeof next_state === "undefined")
                    throw `δ[${state}][${input_symbol}] is missing from the FSM transition table!`;
                else if (!this.Q.includes(next_state))
                    throw `δ[${state}][${input_symbol}] = ${next_state} is an invalid transition, because ${next_state} is a state that doesn't belong to the FSM!`;
                else if (next_state !== state)
                    continue state_loop; // if there is one transition from the current state to another one => it's not a sink node
            }
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
// linguaggio che contiene un numero pari di 0 e un numero dispari di 1
const A000 = new DFSM(["q0", "q1", "q2", "q3"], ["0", "1"], {
    q0: { 0: "q1", 1: "q2" },
    q1: { 0: "q0", 1: "q3" },
    q2: { 0: "q3", 1: "q0" },
    q3: { 0: "q2", 1: "q1" }
}, "q0", ["q2"]);
