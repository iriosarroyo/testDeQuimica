export type Atom = {elem:string, num:number, atoms?:Atom[]}
export type MoleculeNoOxidation = {atoms: Atom[], charge:number}
export interface Molecule extends MoleculeNoOxidation {
    oxNums: number[]
}
export interface Reaction {
    reactants: Molecule[];
    products?: Molecule[];
    coefReact: (number|null)[];
    coefProd?: (number|null)[];
    stateReact: (string | null)[];
    stateProd?: (string | null)[];
    symbol: boolean;
}

export interface AdjustedReaction extends Reaction{
    coefReact: number[],
    coefProd: number[],
    stateProd: (string|null) [],
    stateReact: (string|null) []
}

interface Connection {
    order: number,
    elem: string,
    freeElectrons: number,
}

export interface LewisStructure {
    central: string,
    freeElectrons: number,
    connections: Connection[]
}
