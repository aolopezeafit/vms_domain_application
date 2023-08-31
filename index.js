var express = require('express');
var cors = require('cors');
var autocompleteService = require("./services/autocompleteService");
var additionalRequirements = require('./services/additionalRequirements');
var relatedRequirementsService = require('./services/relatedRequirementsService');
var relatedRequirementsApplicationService = require('./services/relatedRequirementsApplicationService');
var generate = require('./services/generateSRS');

var app = express();
const PORT = process.env.PORT || 8080;
const HOST = '127.0.0.1';

const VERSION = "1.23.04.11.17"

 
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));


app.use(cors());

app.get('/', async function (req, res, next) {
    try {
        res.setHeader('Content-Type', 'application/json');
        let data = {
            message: "Hello world!!!",
            version: VERSION
        }
        res.end(JSON.stringify(data));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.get('/version', async function (req, res, next) {
    try {
        res.end(JSON.stringify({ "version": VERSION }));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/security/suggest', async function (req, res, next) {
    try {
        console.log(req.body.input)
        res.setHeader('Content-Type', 'application/json');
        let data = await autocompleteService.securityRequirementsSuggest(req);
        res.end(JSON.stringify(data));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/security/suggest/functional', async function (req, res, next) {
    try {
        console.log(req.body.input)
        res.setHeader('Content-Type', 'application/json');
        let data = await autocompleteService.functionalRequirementsSuggest(req);
        res.end(JSON.stringify(data));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/domain/suggest', async function (req, res, next) {
    try {
        console.log(req.body.input)
        res.setHeader('Content-Type', 'application/json');
        let data = await autocompleteService.domainRequirementsSuggest(req);
        res.end(JSON.stringify(data));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/domain/suggest/functional', async function (req, res, next) {
    try {
        console.log(req.body.input)
        res.setHeader('Content-Type', 'application/json');
        let data = await autocompleteService.domainFunctionalRequirementsSuggest(req);
        res.end(JSON.stringify(data));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/additionalRequirements', async function (req, res, next) {
    try {
        console.log(req.body.input)
        res.setHeader('Content-Type', 'application/json');
        let data = await additionalRequirements.additionalRequirementsSuggest(req);
        console.log(data);
        res.end(JSON.stringify(data));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/relatedRequirements', async function (req, res, next) {
    try {
        console.log(req.body.data)
        res.setHeader('Content-Type', 'application/json');
        let project = await relatedRequirementsService.suggest(req);
        console.log(project);
        let contentResponse = {
            transactionId: "1",
            message: "Completed.",
            data: {
                content: project
            }
        }
        res.end(JSON.stringify(contentResponse));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/relatedApplicationRequirements', async function (req, res, next) {
    try {
        console.log(req.body.data)
        res.setHeader('Content-Type', 'application/json');
        let project = await relatedRequirementsApplicationService.suggest(req);
        console.log(project);
        let contentResponse = {
            transactionId: "1",
            message: "Completed.",
            data: {
                content: project
            }
        }
        res.end(JSON.stringify(contentResponse));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }
});

app.post('/generate', async function (req, res, next) {
   /*  try {
        console.log('generate')
        console.log(req.body.data)
        res.setHeader('Content-Disposition', 'attachment; filename=SRS-'+req.body.data.project.name+'.docx');
        res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.wordprocessingml.documents; charset=UTF-8')
        let project = await generate.generate(req);
        console.log(project);
        res.send(Buffer.from(project, 'base64'));
    } catch (error) {
        console.log(error)
        res.status(400).send(JSON.stringify(error));
    } */
    try { 
        res.setHeader('Content-Type', 'application/json');
        let project = await generate.generate(req);
        let content_encode = project;
		let dataResponse ={
				"name": 'SRS-'+req.body.data.project.name+'.docx',
				"content": content_encode,
			  };
			  
		let data={
		  "transactionId": 'asdf',
		  "message": 'Success',
		  "data": dataResponse
		}  
        res.end(JSON.stringify(data));
    } catch (error) {
        res.status(400).send(JSON.stringify(error));
    }

});
/* app.post('/generate/SRS', async function (req, res, next) {
    try {
        console.log('generate')
        console.log(req.body.data)
        res.setHeader('Content-Disposition', 'attachment; filename=SRS.docx');
        res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.wordprocessingml.documents; charset=UTF-8')
        let project = await generate.generateSRS(req);
        console.log(project);
        res.send(Buffer.from(project, 'base64'));
    } catch (error) {
        console.log(error)
        res.status(400).send(JSON.stringify(error));
    }
}); */
app.listen(PORT, () => {
    console.log('Running version ' + VERSION + ` on http://${HOST}:${PORT}`);
});


// app.listen(PORT, HOST, () => {
//     console.log(`Running on http://${HOST}:${PORT}`);
// });