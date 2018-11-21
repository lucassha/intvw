const jwt = require('jsonwebtoken');

// decode the jwt 
module.exports = (req, res, next) => {
	try {
		// break down the token to remove the bearer portion
		const token = req.headers.authorization.split(" ")[1];
		// decode the token into its separate pieces
		const decoded = jwt.decode(token);
		req.userData = decoded;
	} catch(error) {
		return res.status(401).json({
			message: {
				error: 'Authentication failure'
			}
		});
	}
	// must add continue for the middleware to proceed if successful
	next();
};