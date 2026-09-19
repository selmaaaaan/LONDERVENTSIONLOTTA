require('dotenv').config();
const mongoose = require('mongoose');
const { getRegistrationGrid } = require('./controllers/teamController');

const req = {
    params: { id: '6a9da92608b6dacb8e7f3661' },
    query: { category: 'All' }
};

const res = {
    status: function(code) {
        this.code = code;
        return this;
    },
    json: function(data) {
        console.log(`Status: ${this.code}`);
        console.log(`Candidates: ${data.candidates ? data.candidates.length : 0}`);
        console.log(`Programmes: ${data.programmes ? data.programmes.length : 0}`);
    }
};

mongoose.connect(process.env.MONGO_URI).then(async () => {
    await getRegistrationGrid(req, res);
    process.exit(0);
});