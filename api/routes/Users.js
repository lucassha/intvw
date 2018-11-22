const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Ship = require('../models/Ship');
const authenticateJWT = require('../auth/authenticate');
const decodeJWT = require('../auth/decode');

router.get('/:userId/ships', authenticateJWT, decodeJWT, (req, res, next) => {
	const userId = req.params.userId;
	// check if decoded userData matches the userId passed into the url parameters
	if(req.userData.userId != userId){
		res.status(403).json({
			message: {
				err: 'Authentication failure'
			}
		});
	} else{
		Ship
		.find({ owner: req.userData.username })
		.select('_id name type length owner')
		.exec()
		.then(results => {
			// res.status(200).json(results);
			const response = {
				count: results.length,
				ships: results.map(doc => {
					return {
						_id: doc._id,
						name: doc.name,
						type: doc.type,
						length: doc.length,
						owner: doc.owner,
						self: 'localhost:3000/ships/'+doc._id
					}
				})
			};
			res.status(200).json(response);
		})
		.catch(err => {
			res.status(500).json({error: err});
		});
	}
});


router.get('/', (req, res, next) => {
	User
		.find()
		.select('username password _id')
		.exec()
		.then(doc => {
			const response = {
				count: doc.length,
				ships: doc.map(doc => {
					return {
						username: doc.username,
						password: doc.password,
						_id: doc._id,
						self: 'localhost:3000/users/'+doc._id
					}
				})
			};
			// send response
			res.status(200).json(response);
		})
		.catch(err => {
			res.status(500).json({error: err});
		});
});

router.post('/signup', (req, res, next) => {
	//first, check if the user already exists in the db
	User.find({ username: req.body.username })
	.exec()
	.then(user => {
		if(user.length > 0){
			return res.status(409).json({
				message: {
					error: 'User already exists'
				}
			});
		} else {
			// if the user exists and a pw was passed in and can be hashed,
			// create a new user and add the hashed pw using bcrypt
			bcrypt.hash(req.body.password, 10, (err, hash) => {
				if(err){
					return res.status(500).json({
						error: err
					});
				} else {
					const user = new User({
						_id: new mongoose.Types.ObjectId(),
						username: req.body.username,
						password: hash
					});
					//save the newly created user
					user
					.save()
					.then(result => {
						res.status(201).json({
							message: 'User successfully created',
							_id: user._id,
							hashed_pw: user.password,
							username: user.username,
							self: 'localhost:3000/users/'+user._id
						});
					})
					.catch(err => {
						console.log(err);
						res.status(500).json({
							error: err
						})
					});
				}
			});
		}
	});
});

router.post('/login', (req, res, next) => {
	User
	.findOne({ username: req.body.username })
	.exec()
	.then(user => {
		if(user.length < 1){
			// no user
			res.status(401).json({
				message: {
					err: 'Authentication failure'
				}
			});
		}
		bcrypt.compare(req.body.password, user.password, (err, result) => {
			// returns an error and/or the result of unencrypting the password
			// result = true if successful. otherwise, false.
			if(err){
				res.status(401).json({
					message: {
						err: 'Authentication failure'
					}
				});
			}
			if(result){
				// jwt sign requires payload, secretKey (just used 'secret'), options, and a callback
				// the callback is ignored and the token var is used instead
				const token = jwt.sign(
					{
						username: user.username,
						userId: user._id
					}, 
					process.env.SECRET_HASH,
					{ expiresIn: "1h" });

				return res.status(200).json({
					message: 'Authentication successful',
					jwt_token: token
				});
			}
			//return this error if you didn't get a result or error
			res.status(401).json({
				message: {
					err: 'Authentication failure'
				}
			});
		})

	})
	.catch(err => {
		console.log(err);
		res.status(500).json({error: err});
	});

});

router.delete('/:userId', (req, res, next) => {
	const userId = req.params.userId;
	console.log(userId);
	
	User
	.deleteOne({ _id: userId })
	.exec()
	.then(result => {
		console.log(result);
		res.sendStatus(204);
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({error: err});
	});
});

module.exports = router;









