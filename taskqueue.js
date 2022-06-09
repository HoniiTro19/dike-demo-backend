const Queue = require('queue-promise');

const queue = new Queue({
    concurrent: 1,
    interval: 10000,
    start: true
})

module.exports = function (someAsyncTask) { queue.enqueue(someAsyncTask) }
