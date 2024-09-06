function cloneModel(model) {
    let json=JSON.stringify(model);
    let clon=JSON.parse(json);
    return clon;
}

//export methods
module.exports = {cloneModel };