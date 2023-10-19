/** this type constructs an exhaustive structure that enables this behaviour:
 * let OBJ ∈ delta. OBJ[q][a] ∈ Q, ∀ q ∈ Q, ∀ a ∈ Σ.
 * Basically this represents the complete function δ : Q x Σ → Q as a table.
 */
type delta<Q extends string, Σ extends string> = {
    [state in Q]: {
        [char in Σ]: Q; // Ensure the value is a valid state
    };
};

interface DFSM<Q extends string, Σ extends string> {
    /** A finite set of states. */
    Q: Q[];
    /** A finite set of input symbols called the alphabet. */
    Σ:Σ[];
    /** A total function that computes the transitions between states δ : Q x Σ → Q represented by a table. */
    δ:delta<Q,Σ>;
    /** An initial state q₀ ∈ Q. */
    q0:Q;
    /** A finite set of accept states F ⊆ Q. */
    F:Q[];
    /** Array of all the sink nodes. */
    sink_nodes: Q[];
}

class DFSM<Q extends string, Σ extends string> {
    /**
     * Constructs the specified deterministic finite-state machine.
     * @param {string[]} Q A finite set of states.
     * @param {string} Σ A finite set of input symbols called the alphabet.
     * @param δ A total function that computes the transitions between states δ : Q x Σ → Q represented by a table.
     * @param {string} q0 An initial state q₀ ∈ Q.
     * @param {string[]} F A finite set of accept states F ⊆ Q.
     */
    constructor(Q:Q[],Σ:Σ[],δ:delta<Q,Σ>,q0:Q,F:Q[]) {
        this.Q = Array.from(new Set(Q));
        if (this.Q.length !== Q.length) console.warn("Removed duplicates from Q!");
        this.Σ = Array.from(new Set(Σ));
        if (this.Σ.length !== Σ.length) console.warn("Removed duplicates from Σ!");
        this.δ = δ;
        if (!this.Q.includes(q0)) throw `${q0} is an invalid initial state because it doesn't belong to the FSM!`;
        this.q0 = q0;
        this.F = Array.from(new Set(F));
        if (this.F.length !== F.length) console.warn("Removed duplicates from F!");
        this.sink_nodes = [];

        state_loop: 
        for (let i=0; i<this.Q.length; i++) {

            let state = this.Q[i];
            let transitions = this.δ[state];

            if (typeof transitions==="undefined") throw `δ[${state}] is missing from the FSM transition table!`;

            for (let j=0; j<this.Σ.length; j++) {

                let input_symbol = this.Σ[j], 
                    next_state = transitions[input_symbol];

                if (typeof next_state==="undefined") throw `δ[${state}][${input_symbol}] is missing from the FSM transition table!`;
                else if (!this.Q.includes(next_state)) throw `δ[${state}][${input_symbol}] = ${next_state} is an invalid transition, because ${next_state} is a state that doesn't belong to the FSM!`;
                else if (next_state !== state) continue state_loop; // if there is one transition from the current state to another one => it's not a sink node
            }

            this.sink_nodes.push(state);
        }
    }

    /** If a given character belongs to the FSM alphabet, typecast it to Σ; throw an error otherwise. */
    #belongsToΣ(char:string): asserts char is Σ {
        for (let i=0; i<this.Σ.length; i++)
            if (this.Σ[i] === char) return;
        throw `The character ${char} is not part of the alphabet!`;
    }

    /** If a given string is composed of characters that belong to the FSM alphabet, convert it to Σ[]; throw an error otherwise. */
    stringBelongsToΣ(string:string): Σ[] {
        let o = [] as Σ[];
        for (let i=0; i<string.length; i++) {
            let y = string[i];
            this.#belongsToΣ(y);
            o.push(y);
        }
        return o
    }

    /** Given an input string, compute its output state. */
    compute(string:string) {
        let parsed = this.stringBelongsToΣ(string);

        let currentState = this.q0;
        for (let i=0; i<parsed.length && !this.sink_nodes.includes(currentState); i++) 
            currentState = this.δ[currentState][parsed[i]];

        return { final_state: currentState, is_accept_state: this.F.includes(currentState) }
    }
}