var projectUtils = require('../utils/projectUtils');
var featuresModelUtils = require('../utils/featuresModelUtils');
var textUtils = require('../utils/textUtils');
var secretGraph = require('./secretGraph.json');
var { Graph } = require('../utils/graph.js');

async function generateFeaturesModel(req) {
    let project = req.body.data.project;
    let modelId = req.body.data.modelSelectedId;
    let domainRequirementsModel = projectUtils.findModel(project, modelId);
    if (!domainRequirementsModel) {
        return project;
    }

    let fw = 100;
    let fh = 66;
    let fx = 512;
    let fy = 80;
    let fdx = 25;
    let fdy = 100;
    let fi = 0

    let dicRequirementFeature = [];
    let requirementsOfAttributes = [];

    for (let r = 0; r < domainRequirementsModel.relationships.length; r++) {
        const relationship = domainRequirementsModel.relationships[r];
        if (relationship.type == "FunctionalRequirement_FunctionalRequirement") {
            let type = projectUtils.findElementProperty(relationship, "Type").value;
            if (type == "Refinement") {
                let requirement = projectUtils.findModelElement(domainRequirementsModel, relationship.sourceId);
                if (requirement.type == "FunctionalRequirement") {
                    let description = projectUtils.findElementProperty(requirement, "Description").value;
                    let words = textUtils.getTextBetweenWords(description, "The", "attribute");
                    if (words.length == 1) {
                        requirementsOfAttributes.push(requirement);
                    }
                }
            }
        }
    }

    let rootRequirementId = null;

    let featuresModel = featuresModelUtils.createFeatureModel("Feature model with attributes");
    let rootFeature = featuresModelUtils.createRootFeature(project.name, fx, fy, fw, fh);
    featuresModel.elements.push(rootFeature);

    let graph = loadGraph();
    //showPaths(graph);

    let requirements = getRequirements(graph, domainRequirementsModel, requirementsOfAttributes); 
    createFeatures(featuresModel, requirements, dicRequirementFeature, fx, fy, fw, fh, fdx, fdy); 
    project.productLines[0].domainEngineering.models.push(featuresModel);
    return project;
}

function getValueFromPart(parts, indexes) {
    for (let i = 0; i < indexes.length; i++) {
        const index = indexes[i];
        if (parts[index]) {
            return parts[index].word;
        }
    }
    return null;
}

function getRequirements(graph, domainRequirementsModel) {
    let initialNodes = graph.findInitialNodes();
    let ret = [];
    for (let m = 0; m < domainRequirementsModel.elements.length; m++) {
        let element = domainRequirementsModel.elements[m];
        if (element.type == "FunctionalRequirement") {
            let description = projectUtils.findElementProperty(element, "Description").value;
            let parts = getSecretParts(graph, initialNodes, description);
            let item = {
                element: element,
                description: description,
                secret: parts
            }
            ret[element] = item;
        }
    }
    return ret;
}

function createFeatures(featuresModel, requirements, dicRequirementFeature, px, py, pw, ph, pdx, pdy) {
    let pi = 0
    for (var key in requirements) {
        if (requirements.hasOwnProperty(key)) {
            requirement = requirements[key];
            let secret = requirement.secret;
            let name = null;
            if (secret) {
                let verb = getValueFromPart(secret, ["_78", "_43"]);
                let obj = getValueFromPart(secret, ["_58"]);
                if (verb) {
                    name = verb;
                    if (obj) {
                        name += ' ' + obj;
                    }
                }
            }
            if (name) {
                let feature = featuresModelUtils.createConcreteFeature(name, px + (pi * (pw + pdx)) + pdx, py + ph + pdy, pw, ph);
                featuresModel.elements.push(feature);
                dicRequirementFeature[element.id] = feature;
                pi++;
            }
        }
    }
}

function createConstraints(graph, featuresModel, domainRequirementsModel, requirementsOfAttributes, dicRequirementFeature, fx, fy, fw, fh, fdx, fdy) {
    let initialNodes = graph.findInitialNodes();
    let rootFeature = featuresModel.elements[0];
    for (let m = 0; m < domainRequirementsModel.elements.length; m++) {
        let element = domainRequirementsModel.elements[m];
        if (element.type == "FunctionalRequirement" && !requirementsOfAttributes.includes(element)) {
            let description = projectUtils.findElementProperty(element, "Description").value;
            let parts = getSecretParts(graph, initialNodes, description);
            if (parts) {
                let type = null;
                if (parts["_70"]) {
                    type = "Mandatory";
                }
                if (parts["_71"]) {
                    type = "Optional";
                }
                if (type) {
                    let feature = dicRequirementFeature[element.id];
                    let relationship = featuresModelUtils.createRelationshipFeature_Feature(rootFeature, feature, type);
                    featuresModel.relationships.push(relationship);
                }
            }
        }
    }
}

function getSecretParts(graph, initialNodes, description) {
    let parts = null;
    let words = NormalizeWords(description);
    for (let i = 0; i < initialNodes.length; i++) {
        const initialNode = initialNodes[i];
        let token = getTokenFromNode(initialNode);
        if (token == words[0]) {
            const paths = graph.findAllPaths(initialNode);
            for (let p = 0; p < paths.length; p++) {
                console.log(p);
                if (p == 66) {
                    let x = 0;
                }
                const path = paths[p];
                let candidateParts = checkPath(path, words);
                if (candidateParts != null) {
                    return candidateParts;
                }
            }
        }
    }

    return parts;
}

function checkPath(path, words) {
    showPath(path);
    let tokenCount = 0;
    for (let t = 0; t < path.length; t++) {
        index = path[t];
        token = getTokenFromNode(index);
        if (token != "//") {
            tokenCount++;
        }
    }
    let tokenCoincidences = [];
    let parts = null;
    let candidateParts = [];
    let w = 0;
    let wildCard = -1;
    let t = 0;
    for (let w = 0; w < words.length; w++) {
        const word = words[w];
        let index = null;
        let token = null;
        while (true) {
            index = path[t];
            token = getTokenFromNode(index);
            if (token != "//") {
                break;
            } else {
                if (!tokenCoincidences.includes(index)) {
                    tokenCoincidences.push(index);
                }
            }
            if (t < path.length - 1) {
                t++;
            } else {
                if (t == wildCard) {
                    return null;
                }
            }
        }
        if (token == word) {
            let item = {
                word: word,
                key: token,
                id: index
            }
            candidateParts['_' + index] = item;
            wildCard = -1;
            if (!tokenCoincidences.includes(index)) {
                tokenCoincidences.push(index);
            }
            t++;
        } else {
            if (token.startsWith('<')) {
                if (!candidateParts['_' + index]) {
                    let item = {
                        word: word,
                        key: token,
                        id: index
                    }
                    candidateParts['_' + index] = item;
                } else {
                    candidateParts['_' + index].word = candidateParts['_' + index].word + ' ' + word;
                }
                wildCard = t;
                if (!tokenCoincidences.includes(index)) {
                    tokenCoincidences.push(index);
                }
                t++;
            }
            else {
                if (wildCard > -1) {
                    t = wildCard;
                    wildCard = -1;
                    w--;
                } else {
                    // t++;
                    return null;
                }
            }
        }
        if (w == words.length - 1) {
            if (path.length == tokenCoincidences.length) {
                for (let t = 0; t < path.length; t++) {
                    if (path[t] != tokenCoincidences[t]) {
                        return null;
                    }
                }
                return candidateParts;
            }
        }
    }
    return null;
}

function getSecretParts2(graph, initialNodes, description) {
    let parts = null;
    let tokens = tokenize(description);
    for (let i = 0; i < initialNodes.length; i++) {
        const initialNode = initialNodes[i];
        let word = getWordFromNode(initialNode);
        if (word == tokens[0]) {
            const paths = graph.findAllPaths(initialNode);
            let candidateParts = [];
            for (let p = 0; p < paths.length; p++) {
                console.log(p);
                const path = paths[p];
                if (p == 66) {
                    let x = 0;
                }
                let w = 0;
                for (let t = 0; t < tokens.length; t++) {
                    let token = tokens[t];
                    if (w >= path.length) {
                        break;
                    }
                    let index = path[w];
                    word = getWordFromNode(index);
                    if (word == "//") {
                        w++;
                        if (w >= path.length) {
                            break;
                        }
                        index = path[w];
                        word = getWordFromNode(index);
                    }
                    w++;
                    if (token == word) {
                        let item = {
                            word: token,
                            key: word,
                            id: index
                        }
                        if (token == "PROVIDE" && word == "PROVIDE") {
                            token = "PROVIDE";
                        }
                        candidateParts['_' + index] = item;
                        if (t == tokens.length - 1) {
                            parts = candidateParts;
                            break;
                        }
                    } else {
                        if (word.startsWith('<')) {
                            let item = {
                                word: token,
                                key: word,
                                id: index
                            }
                            if (token == "PROVIDE" && word == "PROVIDE") {
                                token = "PROVIDE";
                            }
                            candidateParts['_' + index] = item;
                            if (t == tokens.length - 1) {
                                parts = candidateParts;
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                }
                if (parts) {
                    break;
                }
            }
        }
    }

    return parts;
}

function getTokenFromNode(id) {
    let word = secretGraph.nodes[id].name;
    return word;
}

function NormalizeWords(text) {
    let str = text.toUpperCase();
    if (!str.endsWith(".")) {
        str += ".";
    }
    str = str.replace(/\./g, ' . ');
    str = str.replace(/\(/g, ' ( ');
    str = str.replace(/\)/g, ' ) ');
    str = str.trim();
    while (str.includes('  ')) {
        str = replaceDoubleSpacesWithSingle(str);
    }

    let tokens = str.split(' ');
    return tokens;
}

function replaceDoubleSpacesWithSingle(inputString) {
    return inputString.replace(/ {2}/g, ' ');
}

function loadGraph() {
    let graph = new Graph();
    if (true) {
        let dic = [];
        for (let i = 0; i < secretGraph.nodes.length; i++) {
            const node = secretGraph.nodes[i];
            graph.addVertex(i);
            dic[node.id] = i;
        }
        for (let i = 0; i < secretGraph.edges.length; i++) {
            const edge = secretGraph.edges[i];
            let sourceId = dic[edge.sourceNodeId];
            let targetId = dic[edge.targetNodeId];
            graph.addEdge(sourceId, targetId);
        }
    } else {
        graph.addVertex('A');
        graph.addVertex('B');
        graph.addVertex('C');
        graph.addVertex('D');

        graph.addEdge('A', 'B');
        graph.addEdge('A', 'C');
        graph.addEdge('B', 'D');
        graph.addEdge('C', 'D');
    }
    return graph;
}

function showPaths(graph) {
    const startNode = 0;
    const paths = graph.findAllPaths(startNode);
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        let words = [];
        for (let j = 0; j < path.length; j++) {
            const id = path[j];
            let name = secretGraph.nodes[id].name;
            if (name != "//") {
                words.push(name);
            }
        }
        console.log(words.join(' '));
    }
}

function showPath(path) {
    let words = [];
    for (let j = 0; j < path.length; j++) {
        const id = path[j];
        let name = secretGraph.nodes[id].name;
        if (name != "//") {
            words.push(name);
        }
    }
    console.log(words.join(' '));
}




//export methods
module.exports = { generateFeaturesModel };