import ResponseManager from '#utils/response-magager.js';
import TestModel from '#models/test-model.js';
import TestView from '#views/test-view.js';
import ErrorTypes from '#utils/error-types.js';
import PROBLEMS from '#configs/problems.js';

const TestController = {

    index: async (req, res) => {

        try {
            const tests = await TestModel.selectAll();
            ResponseManager.send(req, res, 200, TestView.collection(tests));
            return true;
        } catch (err) {
            if (err instanceof ErrorTypes.DatabaseError) {
                ResponseManager.problem(req, res, PROBLEMS.SERVICE_UNAVAILABLE, 'Service Unavailable');
                return false;
            }

            throw err;
        }

    }

};

export default TestController;
