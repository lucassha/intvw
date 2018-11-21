const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Ship = require('../models/Ship');
const authenticateJWT = require('../auth/authenticate');
const decodeJWT = require('../auth/decode');

router.get('/:shipId', authenticateJWT, decodeJWT, (req, res, next) => {
	const shipId = req.params.shipId;

	Ship.findById(shipId)
	  .select('name type length owner _id')
	  .exec()
	  .then(doc => {
	  	console.log(doc);
	  	// check the id is valid
	  	if (doc) {
	  		const response = {
	  			name: doc.name,
	  			type: doc.type,
	  			length: doc.length,
	  			owner: doc.owner,
	  			_id: doc._id,
	  			request: {
	  				type: 'GET',
	  				description: 'Get all ships',
	  				url: 'localhost:3000/ships'
	  			}
	  		}
	  		res.status(200).json(response);
	  	} else {
	  		// if id string is the proper length, it won't throw an error but return a NULL result
	  		res.status(404).json({message: 'No valid entry for ID passsed in'})
	  	}
	  })
	  .catch(err => {
	  	console.log(err);
	  	res.status(500).json({
	  		error: {
	  			message: 'No valid entry for ID passed in'
	  		}
	  	});
	  });
});

router.get('/', (req, res, next) => {
	Ship
	.find()
	.select('name type length owner _id')
	.exec()
	.then(result => {
		const response = {
			count: result.length,
			ships: result.map(doc => {
				return {
					name: doc.name,
					type: doc.type,
					length: doc.length,
					owner: doc.owner,
					_id: doc._id,
					self: 'localhost:3000/ships/'+doc._id
				}
			})
		};
		res.status(200).json(response);
	})
	.catch(err => {
		res.status(500).json({error: err});
	});
});

router.post('/', authenticateJWT, decodeJWT, (req, res, next) => {
	// confirm whether the owner passed in is the same as the decoded username field
	if(req.userData.username != req.body.owner){
		res.status(403).json({
			message: {
				error: 'Authentication failure'
			}
		});
	} else {
		const ship = new Ship({
			_id: new mongoose.Types.ObjectId(),
			name: req.body.name,
			type: req.body.type,
			length: req.body.length,
			owner: req.body.owner
		});

		// save the ship if jwt is valid and decoded username matches
		ship
		.save()
		.then(result => {
			res.status(201).json({
				message: 'Ship successfully created',
				ship_id: ship._id,
				ship_name: ship.name,
				ship_type: ship.type,
				ship_length: ship.length,
				ship_owner: ship.owner,
				self: 'localhost:3000/ships/'+ship._id
			});
		})
		.catch(err => {
			res.status(500).json({error: err});
		});
	}
});

router.delete('/:shipId', authenticateJWT, decodeJWT, (req, res, next) => {
	const shipId = req.params.shipId;

	Ship.findById(shipId)
	.select('owner _id')
	.exec()
	.then(user => {
		console.log(user);
		// if the decoded username passed in is not the same, do not allow deletion
		// must wrap in an if/else statement or else you risk still executing .remove()
		if(req.userData.username != user.owner){
			res.status(403).json({
				message: {
					error: 'Authentication failure'
				}
			});
		} else {
			// decoded username is the same. remove the ship based on passed in shipId
			Ship
			.remove({ _id: shipId })
			.exec()
			.then(result => {
				console.log(result);
				res.sendStatus(204);
			})
			.catch(err => {
				res.status(500).json({error: err});
			});
		}
	})
	.catch(err => {
		res.status(500).json({error: 'Authentication failure'});
	});
});

module.exports = router;












