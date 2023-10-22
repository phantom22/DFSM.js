type incomplete_state_transitions<Q extends string> = { [char:string]: Q };

type state_transitions<Q extends string, Σ extends string> = {
    [char in Σ]: Q
}

type incomplete_δ<Q extends string, Σ extends string> = {
    [state in Q]: state_transitions<Q,Σ> | [transitions:incomplete_state_transitions<Q>, default_transition_state:Q]
}

/** 
 * this type constructs an exhaustive structure that enables this behaviour:
 * 
 * let OBJ ∈ δ<Q,Σ>. OBJ[q][a] ∈ Q, ∀ q ∈ Q, ∀ a ∈ Σ.
 * 
 * Basically this represents the complete function δ : Q x Σ → Q as a table.
 */
type δ<Q extends string, Σ extends string> = {
    [state in Q]: state_transitions<Q,Σ>;
}

class DFSM<Q extends string, Σ extends string> {
    /** A finite set of states. */
    Q: Q[];
    /** A finite set of input symbols called the alphabet. */
    Σ:Σ[];
    /** A total function that computes the transitions between states δ : Q x Σ → Q represented by a table. */
    δ:δ<Q,Σ>;
    /** An initial state q0 ∈ Q. */
    q0:Q;
    /** A finite set of accept states F ⊆ Q. */
    F:Q[];
    /** Array of all the sink nodes. */
    sink_nodes: Q[] = [];
    /** Automatas label. */
    label: string;

    /**
     * Constructs the specified deterministic finite-state machine.
     * @param {string[]} Q A finite set of states.
     * @param {string} Σ A finite set of input symbols called the alphabet.
     * @param {object} δ A total function that computes the transitions between states δ : Q x Σ → Q represented by a table in its full form; each entry can be also represented with a short-hand form which looks like this: [incomplete_δ: contains part of the transitions, default_transition_state: all the missing transitions from incomplete_δ will point to this default state].
     * @param {string} q0 An initial state q₀ ∈ Q.
     * @param {string[]} F A finite set of accept states F ⊆ Q.
     * @param {string} [label=""] Optional parameter, that simply helps to distinguish multiple automata.
     */
    constructor(Q:Q[],Σ:Σ[],δ:incomplete_δ<Q,Σ>,q0:Q,F:Q[],label="") {
        this.Q = Array.from(new Set(Q));
        this.Σ = Array.from(new Set(Σ));

        this.#complete_δ(δ);
        this.δ = δ;

        this.validate_state(q0)
        this.q0 = q0;

        this.F = Array.from(new Set(F)).map(v => {
            this.validate_state(v);
            return v
        });

        this.label = label;
    }

    /** If a given symbol belongs to the FSM alphabet, typecast it to Σ; throw an error otherwise. */
    validate_char(char:string): asserts char is Σ {
        for (let i=0; i<this.Σ.length; i++)
            if (this.Σ[i] === char) return;
        throw `The symbol ${char} is not part of the Σ!`;
    }

    /** If a given state belongs to the FSM, typecast it to Q; throw an error otherwise. */
    validate_state(state:string, origin=""): asserts state is Q {
        for (let i=0; i<this.Q.length; i++)
            if (this.Q[i] === state) return;
        throw typeof origin==="string"&&origin!=="" ? 
                    `${origin} points to "${state}" which is not part of the Q! ` : 
                    `The state "${state}" is not part of the Q!`;
    }
    /** If a given string is composed of symbols that belong to the FSM alphabet, convert it to Σ[]; throw an error otherwise. */
    validate_input(string:string): Σ[] {
        return string.split("").map(v => {
            this.validate_char(v);
            return v
        })
    }

    /** Converts a short-hand transition table to a complete one. */
    complete_state_transitions(state_transitions:incomplete_state_transitions<Q>, default_transition_state:Q): asserts state_transitions is state_transitions<Q,Σ> {
        this.validate_state(default_transition_state);

        let provided_inputs = Object.keys(state_transitions).map(v => {
            this.validate_char(v);
            this.validate_state(state_transitions[v]);
            return v
        });

        for (let i=0; i<this.Σ.length; i++) {
            let a = this.Σ[i];
            if (provided_inputs.includes(a)) continue;
            state_transitions[a] = default_transition_state;
        }
    }
    /** Converts all the short-hand transitions to their complete version while checking the completeness of δ. */
    #complete_δ(δ:incomplete_δ<Q,Σ>): asserts δ is δ<Q,Σ> {

        for (let i=0; i<this.Q.length; i++) {

            let q = this.Q[i],
                t = δ[q];

            if (typeof t==="undefined") 
                throw `δ is incomplete: δ["${q}"] is missing from the FSM transition table!`;
            else if (typeof t!=="object") 
                throw `δ is incomplete: δ["${q}"] points to an invalid data type [expected:object, got:${typeof t}]`;

            let sink_node = true;

            // if short-hand transitions
            if (Array.isArray(t) && t.length===2) {
                let transitions = t[0],
                    transition_states = Object.keys(transitions).map(v => transitions[v]),
                    default_transition_state = t[1];

                for (let j=0; j<transition_states.length; j++) 
                    if (transition_states[j] !== default_transition_state)
                        sink_node = false;
                
                this.complete_state_transitions(transitions, default_transition_state);
                δ[q] = transitions;
            }
            // if transitions in full
            else {

                for (let j=0; j<this.Σ.length; j++) {

                    let a = this.Σ[j], 
                        next_q = t[a as string];

                    if (typeof next_q==="undefined") 
                        throw `δ is incomplete: δ["${q}"]["${a}"] is missing from the FSM transition table!`;
                    else if (typeof next_q!=="string") 
                        throw `δ is incomplete: δ["${q}"]["${a}"] points to an invalid data type [expected:string, got:${typeof next_q}]`;
                    else this.validate_state(next_q,`δ is incomplete: δ["${q}"]["${a}"]`);

                    if (next_q !== q) sink_node = false; // if there is one transition from the current state to another one => it's not a sink node
                }

            }

            if (sink_node) this.sink_nodes.push(q);
        }

    } 

    /** Given an input string, compute its output state; will throw an error if the input string contains symbols that do not belong to Σ. */
    read(input:string) {
        let parsed = this.validate_input(input);

        let currentState = this.q0;
        for (let i=0; i<parsed.length && !this.sink_nodes.includes(currentState); i++) 
            currentState = this.δ[currentState][parsed[i]];

        return currentState
    }

    /** Returns true if a given input belongs to the language represented by the automata. */
    test(input:string) {
        let finalState: Q;
        try {
            finalState = this.read(input);
        }
        catch(e) {
            return false;
        }
        return this.F.includes(finalState)
    }
}