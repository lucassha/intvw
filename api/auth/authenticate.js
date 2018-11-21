const jwt = require('jsonwebtoken');

// very the jwt token passed in
module.exports = (req, res, next) => {
	try {
		// token is passed in the header as 'Bearer <token here>'
		// in the var below, remove bearer and the white space
		const token = req.headers.authorization.split(" ")[1];
		// console.log(token);
		const decoded = jwt.verify(token, 'secret');
		// req.userData = decoded;
	} catch(error){
		return res.status(401).json({
			message: {
				error: 'Authentication failure'
			}
		});
	}
	// must add continue for the middleware to proceed if successful
	next();
};