class TaskList {

  /**
   * Tabs
   *
   * @var {Array}
   */
  static tabs = [
    [], // 0: Active
    [], // 1: Completed
  ]

  /**
   * Tasks from active tab
   *
   * @var {Array} */
  static get active() { return TaskList.tabs[ 0 ] }

  /**
   * Tasks from completed tab
   *
   * @var {Array} */
  static get completed() { return TaskList.tabs[ 1 ] }










  /**
   * Container to render tasks in
   *
   * @var {Element}
   */
  static get container() { return select( '.tasks-container' )[ 0 ] }

  /**
   * Clear container from tasks
   *
   * @returns {void}
   */
  static clearContainer() { TaskList.container.innerHTML = null }



  /**
   * Get task by it's id from current or specified tab
   *
   * @param {number} taskID
   * @param {Array|null} tab
   * @returns [Object[]]
   */
  static getTask( taskID, tab = null ) { return ( !tab && ( tab = TaskList.getCurrentTasks() ) ) && tab[ taskID ] }

  static replace( taskID, newTaskData ) {
    TaskList.tabs[ state.activeTabID ][ taskID ] = newTaskData
    return newTaskData
  }

  /**
   * Get tasks for current tab
   *
   * @returns {Array}
   */
  static getCurrentTasks() {
    return TaskList.tabs[state.activeTabID].sort((a, b) => {
      if (a.until.date === null) return 1;
      if (b.until.date === null || a.until.date < b.until.date) return -1;

      if (a.until.date === b.until.date) {
      if (a.until.time === null) return 1;
      if (b.until.time === null || a.until.time < b.until.time) return -1;
      }

      return 0;
    })
  }

  /**
   * Filter tasks from current tab
   *
   * @param {Array} filter
   * @returns {Array}
   */
  static getTasksByFilter( filter ) {
    let filtered = [];

    each( TaskList.getCurrentTasks(), ( task, taskID ) => {
      let matched = Task.matchFilter( task, filter );
      if ( matched ) {
        // Save original task id
        matched.id = taskID;
        filtered.push( matched )
      }
    } );

    return filtered;
  }

  /**
   * Push task to active tab
   *
   * @param {Object} task
   * @returns {void}
   */
  static pushActive( task ) { TaskList.tabs[ 0 ].push( task ) }

  /**
   * Push task to completed tab
   *
   * @param {Object} task
   * @returns {void}
   */
  static pushCompleted( task ) { TaskList.tabs[ 1 ].unshift( task ) }





  /**
   * Load tabs
   *
   * @param {Array} tabs
   */
  static load( tabs ) { TaskList.tabs = tabs }

  /**
   * Save tabs to the localStorage
   *
   * @returns {void}
   */
  static save() {
    storage.save( 'tabs', TaskList.tabs.map(
      tab => ( tab.map(
        task => ( { title: task.title, until: task.until, completed: task.completed, subs: task.subs } )
      ) )
    ) );

    render();
  }

}
