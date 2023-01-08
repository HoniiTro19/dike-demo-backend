const Queue = require('queue-promise');

const queue = new Queue({
    concurrent: 1,
    interval: 60000,
    start: true
})

module.exports = {
    enqueue: function (someAsyncTask) {
        queue.enqueue(() => {
            return someAsyncTask;
        })
    }
};
