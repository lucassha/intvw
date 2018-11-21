/*
shannon lucas
assignment 7
cs493

resources used:
https://www.youtube.com/playlist?list=PL55RiY5tL51q4D-B63KBnygU6opNPFk_q
	this youtube series goes over how to use json web tokens for 
	allowing sign in and access by placing in middleware within the routes

jwt.io

https://github.com/auth0/node-jsonwebtoken

*/

const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const shipRoutes = require('./api/routes/Ships');
const userRoutes = require('./api/routes/Users');

mongoose.connect('mongodb://admin:admin@myproject-shard-00-00-ecis9.mongodb.net:27017,myproject-shard-00-01-ecis9.mongodb.net:27017,myproject-shard-00-02-ecis9.mongodb.net:27017/test?ssl=true&replicaSet=myproject-shard-0&authSource=admin&retryWrites=true',
	{
		useNewUrlParser: true,
		useCreateIndex: true
	}
);

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());  //json as a method but without arguments

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', '*');
	if (req.method === 'OPTIONS'){
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
		return res.status(200).json({});
	}
	next(); 
});

app.use('/ships', shipRoutes);
app.use('/users', userRoutes);

/*
 no routes were suited to handle the request.
 hence, catch all requests that make it past the two middleware requests
 with some type of error thrown (either 404 or 500)
*/

app.use((req, res, next) => {
	const error = new Error('Not found');
	error.status = 404;
	next(error);
});

app.use((error, req, res, next) => {
	res.status(error.status || 500);
	res.json({
		error: {
			message: error.message
		}
	});
});

const port = 3000;

app.listen(port, function(){
	console.log('listening at port ' + port);
});