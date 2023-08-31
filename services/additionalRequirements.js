var axios = require('axios');
const ip = "http://193.52.45.42:8585/";

var domains=[];
var securityCriteria = [];
var securityMechanism = [];
var ensuresCriteria=[];
var isAppliedByCriteria=[];
var precedesCriteria=[];
var providesCriteria=[];
var testsForCriteria=[];
var conservesCriteria=[];
var contributesToCriteria=[];
var revokesCriteria=[];
var additionalReq=[];

//Get all security criteria in the ontologu
const getAllCriteria = async () => {

    try {
        var res = await axios.get(ip + 'criteria')
        //console.log(res);
        securityCriteria = res.data;

        //.then((response)=>{

        //securityCriteria=response.data;
        //})
        //.catch(function (error) {
        //console.log(error.toJSON());
        //});
    }
    catch (e) {
        console.log(e)
    }

}
//Get all security criteria in the ontologu
const getAllDomains = async () => {

    try {
        var res = await axios.get(ip + 'domain')
        //console.log(res);
        domains = res.data;

        //.then((response)=>{

        //securityCriteria=response.data;
        //})
        //.catch(function (error) {
        //console.log(error.toJSON());
        //});
    }
    catch (e) {
        console.log(e)
    }

}


//Get all additional criteria
const getCriteria = async (rel,criterion) => {

    try {
        var res = await axios.get(ip + 'criteria/'+rel+'/'+criterion)
        //console.log(res);
        if(rel=='ensures')
        ensuresCriteria = res.data;
        if(rel=='isAppliedBy')
        isAppliedByCriteria=res.data;
        if(rel=='precedes')
        precedesCriteria=res.data;
        if(rel=='provides')
        providesCriteria=res.data;
        if(rel=='testsFor')
        testsForCriteria=res.data;
        if(rel=='conserves')
        conservesCriteria=res.data;
        if(rel=='contributesTo')
        contributesToCriteria=res.data;
        if(rel=='revokes')
        revokesCriteria=res.data;

        //.then((response)=>{

        //securityCriteria=response.data;
        //})
        //.catch(function (error) {
        //console.log(error.toJSON());
        //});
    }
    catch (e) {
        console.log(e)
    }

}
const getDomainCriteria = async (rel,criterion,domain) => {
    console.log(domain)
    try {
        var res = await axios.get(ip + 'domain/'+domain+'/'+rel+'/'+criterion)
        //console.log(res);
        if(rel=='ensures')
        ensuresCriteria = res.data;
        if(rel=='isAppliedBy')
        isAppliedByCriteria=res.data;
        if(rel=='precedes')
        precedesCriteria=res.data;
        if(rel=='provides')
        providesCriteria=res.data;
        if(rel=='testsFor')
        testsForCriteria=res.data;
        if(rel=='conserves')
        conservesCriteria=res.data;
        if(rel=='contributesTo')
        contributesToCriteria=res.data;
        if(rel=='revokes')
        revokesCriteria=res.data;

        //.then((response)=>{

        //securityCriteria=response.data;
        //})
        //.catch(function (error) {
        //console.log(error.toJSON());
        //});
    }
    catch (e) {
        console.log(e)
    }

}
async function getCriteriaMechanisms(criterion) {

    try {
        var res = await axios.get(ip + 'criteria/' + criterion + '/mechanisms')
        //console.log(res);
        securityMechanism = res.data;

        //.then((response)=>{

        //securityCriteria=response.data;
        //})
        //.catch(function (error) {
        //console.log(error.toJSON());
        //});
    }
    catch (e) {
        console.log(e)
    }

}
function elementInSentence(obj, sentence) {
    var str = "";
    Object.keys(obj).some(element => {
        //console.log(element);
        if (sentence.match(element + " ")) { console.log(element); str = element; }
    })
    return str;
}
function ObjectInSentence(obj, sentence) {
    var str = "";
    Object.keys(obj).some(element => {
        //console.log(element);
        if (sentence.match("of " + element + " ")) { console.log(element); str = element; }
    })
    return str;
}
//Add requirement to the json string
function addReq(arr,priority,str0,str1){
    arr.forEach(element => {
        if(priority=='High'){
            if(str0.includes('should')) str0=str0.replace('should','shall');
            if(str0.includes('could')) str0=str0.replace('could','shall');
        }
        if(priority=='Medium'){
            if(str0.includes('shall')) str0=str0.replace("shall","should");
            if(str0.includes('could')) str0=str0.replace('could','should');
            
        }
        if(priority=='Low'){
            if(str0.includes('should')) str0=str0.replace('should','could');
            if(str0.includes('shall')) str0=str0.replace('shall','could');
        }
        additionalReq.push({'criteria':element,'priority':priority,'requirement':str0+element+str1})
        
    });
}


async function additionalRequirementsSuggest(req) {
        console.log("here2")
        additionalReq=[];
        if(securityCriteria.length==0)
        await getAllCriteria();
        if(domains.length==0)
        await getAllDomains();

        console.log(domains)
        console.log(req.body.input)
        //res.setHeader('Content-Type', 'application/json');
        
        var sentence = req.body.input.trim();
        console.log(sentence);
        console.log(securityCriteria);
        
        var sc;
        securityCriteria.some(element => {
            if (sentence.match(element)) sc=element;
        })
        console.log(sc);
        var str1=req.body.input.trim().split("by");
        var words = str1[0].trim().split(sc);
        console.log(req.body.domain)
        if(domains.includes(req.body.domain)){
            await getDomainCriteria('isAppliedBy',sc,req.body.domain);
            console.log(isAppliedByCriteria)
            addReq(isAppliedByCriteria,"High",words[0],words[1]);
            await getDomainCriteria('ensures',sc,req.body.domain);
            console.log(ensuresCriteria);
            addReq(ensuresCriteria,"High",words[0],words[1]);
            await getDomainCriteria('precedes',sc,req.body.domain);
            console.log(precedesCriteria);
            addReq(precedesCriteria,"High",words[0],words[1]);
            await getDomainCriteria('provides',sc,req.body.domain);
            console.log(providesCriteria);
            addReq(providesCriteria,"Medium",words[0],words[1]);
            await getDomainCriteria('testsFor',sc,req.body.domain);
            console.log(testsForCriteria);
            addReq(testsForCriteria,"Medium",words[0],words[1]);
            await getDomainCriteria('conserves',sc,req.body.domain);
            console.log(conservesCriteria);
            addReq(conservesCriteria,"Medium",words[0],words[1]);
            await getDomainCriteria('contributesTo',sc,req.body.domain);
            console.log(contributesToCriteria);
            addReq(contributesToCriteria,"Low",words[0],words[1]);
            await getDomainCriteria('revokes',sc,req.body.domain);
            console.log(revokesCriteria);
            addReq(revokesCriteria,"Low",words[0],words[1]);
        }
        else{
            await getCriteria('isAppliedBy',sc);
            console.log(isAppliedByCriteria)
            addReq(isAppliedByCriteria,"High",words[0],words[1]);
            await getCriteria('ensures',sc);
            console.log(ensuresCriteria);
            addReq(ensuresCriteria,"High",words[0],words[1]);
            await getCriteria('precedes',sc);
            console.log(precedesCriteria);
            addReq(precedesCriteria,"High",words[0],words[1]);
            await getCriteria('provides',sc);
            console.log(providesCriteria);
            addReq(providesCriteria,"Medium",words[0],words[1]);
            await getCriteria('testsFor',sc);
            console.log(testsForCriteria);
            addReq(testsForCriteria,"Medium",words[0],words[1]);
            await getCriteria('conserves',sc);
            console.log(conservesCriteria);
            addReq(conservesCriteria,"Medium",words[0],words[1]);
            await getCriteria('contributesTo',sc);
            console.log(contributesToCriteria);
            addReq(contributesToCriteria,"Low",words[0],words[1]);
            await getCriteria('revokes',sc);
            console.log(revokesCriteria);
            addReq(revokesCriteria,"Low",words[0],words[1]);
        }
        
        
        
        
       

        let data = { "input": sentence, "additionalReq":additionalReq };

        return data;

}
module.exports = { additionalRequirementsSuggest};
 
