const express = require('express');

const router = express.Router();

const {
    createEnquiry,
    getClientEnquiries,
    getAllEnquiries,
    replyToEnquiry
} = require('../controllers/enquiryController');


// CLIENT
router.post('/', createEnquiry);

router.get(
    '/client/:projectId/:email',
    getClientEnquiries
);


// ADMIN
router.get(
    '/admin/all',
    getAllEnquiries
);

router.put(
    '/admin/reply',
    replyToEnquiry
);


module.exports = router;