import * as fs from 'fs';
import chalk from 'chalk';
import {meshDataType, meshValue} from "./types";

const data = process.argv;
const inputNumber = Number(data.slice(3, 4));
const path = data.slice(2, 3).toString();

// get data from json file
const getData = () => {
    let data;
    try {
        data = JSON.parse(fs.readFileSync(`./${path}`, 'utf-8'));
    } catch (error) {
        console.error(`${chalk.red('Something went wrong!')} 
        ${chalk.yellow('Hint: Make sure that the file is in the same directory')}`)
    }
    return data;
}

// helper sorting function
const sortObj = (list: meshValue[], key: string) => {
    const compare = (a: any, b: any) => {
        let result;
        a = a[key];
        b = b[key];
        const type = (typeof a === 'string' || typeof b === 'string') ? 'string' : 'number'
        result = (type === 'string') ? a.localeCompare(b) : a - b
        return result;
    }
    return list.sort(compare).reverse();
}

// this function takes a json object, returns [{element_id: element_id1, value: <number value>}, ...]
const findViewSpot = (data: meshDataType) => {

    if (!path || !inputNumber || data === undefined) {
        console.error(chalk.yellow('Please input a valid filename and an input number'))
        return;
    }

    const {elements, values} = data;
    // adjacency list for each element
    const adjacencyList: { [key: string]: number[] } = {};
    // hashmap for values, O(1) access
    const valuesMap: { [key: string]: number } = {};
    // isConnected, if two elements are connected directly by some node
    const isConnected: { [key: string ]: boolean } = {};

    // build up the adjacency list
    // nodes to element mapper, adjacency list will store: for each node, which elements are attached with this node
    elements.forEach(({id, nodes}) => {
        nodes.forEach((node) => {
            if (adjacencyList[node] === undefined) {
                adjacencyList[node] = []; // if not defined yet, initialize an empty list
            }
            if (adjacencyList[node] !== undefined) {
                adjacencyList[node].push(id);
            }
        })
    })

    // create a hashmap of values
    values.forEach(({element_id, value}) => {
        valuesMap[element_id] = value
    })

    const localMaxima: meshValue[] = [];

    // traverse each element, find all of it's neighbors, check for values, if it is the highest add it to local maxima
    elements.forEach(({id, nodes}) => {
        const elementId = id,
            elementValue = valuesMap[elementId];
        let isLocalMaxima: boolean = true;

        nodes.forEach((node) => {
            adjacencyList[node].forEach((element: number) => {
                const neighborElementId = element;
                const neighborElementValue = valuesMap[neighborElementId];

                // build an edge
                isConnected[elementId-neighborElementId] = true;
                isConnected[neighborElementId-elementId] = true;

                if (neighborElementValue > elementValue) {
                    isLocalMaxima = false;
                }
            })
        })
        if (isLocalMaxima) {
            localMaxima.push({
                "element_id": elementId,
                "value": elementValue
            })
        }
    })

    let localMaximaSorted = sortObj(localMaxima, 'value');

    // final check
    const finalLocalMaxima = [];

    for (let i = 0; i < localMaximaSorted.length; i++) {
        if (i === localMaximaSorted.length - 1) {
            finalLocalMaxima.push(localMaximaSorted[i]);
            break;
        }
        if (localMaximaSorted[i].value === localMaximaSorted[i + 1].value) {
            const elementId1 = localMaximaSorted[i].element_id;
            const elementId2 = localMaximaSorted[i + 1].element_id;

            if (isConnected[elementId1-elementId2] !== undefined) {
                if (isConnected[elementId1-elementId2] === true) {
                    // do nothing
                } else {
                    finalLocalMaxima.push(localMaximaSorted[i]);
                }
            } else {
                finalLocalMaxima.push(localMaximaSorted[i]);
            }
        } else {
            finalLocalMaxima.push(localMaximaSorted[i]);
        }
    }
    return finalLocalMaxima;
}

const start = new Date().getTime(),
    meshData = getData(),
    localMax = findViewSpot(meshData);

if (localMax) {
    console.log(localMax.slice(0, inputNumber));
}

const end = new Date().getTime();
console.log(`Total time taken: ${end - start} ms`)
