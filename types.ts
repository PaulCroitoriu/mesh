export type meshDataType = {
    elements: Array<meshElements>,
    nodes: Array<meshNodes>,
    values: Array<meshValue>,
}

type meshElements = {
    id: number,
    nodes: Array<number>,
}

type meshNodes = {
    id: number,
    x: number,
    y: number
}

export type meshValue = {
    element_id: number,
    value: number,
}