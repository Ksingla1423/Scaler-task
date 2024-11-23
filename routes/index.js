const express = require('express');
const router = express.Router();
const IndexController = require('../controllers/indexController');

// Home route
router.get('/', IndexController.homeController);

// Create Interview
router.post('/create-list', IndexController.createList);

// Delete Interview
router.delete('/delete/:id', IndexController.DeleteList); // Use DELETE method and include interview ID in the route

// Create Participant
router.post('/add-participant', IndexController.addParticipant); // Renamed to clarify it's for participants

// Get Info
router.get('/info/:id', IndexController.getInfo); // Pass ID as a route parameter for clarity and RESTful design

// Edit Interview
router.put('/edit-list/:id', IndexController.edit); // Use PUT method for editing and include ID in the route

module.exports = router;
