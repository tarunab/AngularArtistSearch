require('dotenv').load();
var express = require('express');
var app = express();
var edge = require('edge');
var bodyParser = require('body-parser');
var port = 8000;
var sql = require('mssql');
var spauth = require('node-sp-auth');
var request = require('request-promise');


var getJobs = edge.func('sql', function () {
    /* EXEC job.uspFetchJobs */
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    'extended': 'true'
}));
app.use(bodyParser.json());
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));

var getSteps = edge.func('sql', function () {
    /* EXEC [job].[uspFetchSteps]  */
}); 

app.get('/api/jobs', function (req, res) {
    var Portfolio = 'SAM';
	
    getJobs({"Portfolio": Portfolio}, function (error, result) {
        
        if (error) {
            //logError(error, res);
            console.log(error);
            return;
        }
        if (result) {
            //jsonValue = JSON.stringify(result, null, 4);   
            console.log(result);
            res.json(result);
        }
    });
});

app.get('/api/steps', function (req, res) {
    spauth
        .getAuth('https://testmaq.sharepoint.com/ISMS/', {
            username: 'shahida@maqsoftware.com',
            password: 'mzctkkhnhrjrdymb'
        })
        .then(function (data) {
            var headers = data.headers;
            headers['Accept'] = 'application/json;odata=verbose';

            request.get({
                url: "https://testmaq.sharepoint.com/ISMS/_api/web/lists/getByTitle('JobConfiguration')/items",
                headers: headers,
                json: true
            }).then(function (response) {
                var ans = [];
                for (var i = 0; i < response.d["results"].length; i++) {
                    var temp = {};
                    temp['ProjectID'] = response.d["results"][i]["ProjectID"];
                    temp['ServerName'] = response.d["results"][i]["ServerName"];
                    temp['Environment'] = response.d["results"][i]["Environment"];
                    temp['JobName'] = response.d["results"][i]["JobName"];
                    temp['Account'] = response.d["results"][i]["Account"];
                    temp['Password'] = response.d["results"][i]["Password"];
                    ans.push(temp);
                }
                // console.log(ans);
                res.send(ans);
            });
        });
});

app.post('/api/jobSteps', function (req, res) {
    jobName = req.body.JobName;
    console.log(req.body);
    getSteps({'JobName':jobName}, function (error, result) {
        if (error) {
            console.log(error);
            return;
        }
        if (result) {
            //jsonValue = JSON.stringify(result, null, 4);   
            //console.log(result);
            res.json(result);
        }
    });
});

const config = {
    user: 'kunalb',
    password: 'Pass@123',
    server: 'maqdataflow.database.windows.net', // You can use 'localhost\\instance' to connect to named instance 
    database: 'dataflowdev',
    port: 1433,
    options: {
        encrypt: true
    }
}

app.post('/api/FormJob', function (req, res) {
   console.log(req.body);
    const tvp = new sql.Table();
    tvp.columns.add('ParamKey', sql.NVarChar(100));
    tvp.columns.add('ParamValue', sql.NVarChar(200));
    // tvp.rows.add('JobName', 'InsideSales');
	tvp.rows.add(req.body);
   var JobPool = new sql.ConnectionPool(config, err => {
        JobPool.request()
            .input('Params', tvp)
            .input('QueryId', 53)
            .execute('[job].[uspPerformOperation]', (err, result) => {
				console.log(err);
				console.log(result);
				res.send(result);
			});
			
	});
	
});


app.get('*', function (req, res) {
    res.sendfile('./public/index.html');
});

app.listen(port);
console.log("App listening on port : " + port);