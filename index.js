const tasks = {
  js: require('./tasks/tasks-js').default,
  move: require('./tasks/tasks-move').default,
  scss: require('./tasks/tasks-scss').default,
  rev: require('./tasks/tasks-rev').default
};

exports.Tasker = function (config) {

  this.config = config || {};

  this.getTask = (task) => {

    if (!tasks[task]) {
      throw new Error('Task `' + task + '` not found.');
    }

    const taskConfig = this.config[task] || {};
    return tasks[task](taskConfig);

  };

};