let TaskList = {

  /**
   * Tabs
   *
   * @var {Array}
   */
  tabs: [
    [], // 0: Active
    [], // 1: Completed
  ],










  /**
   * Container to render tasks in
   *
   * @var {Element}
   */
  get container() { return select( '.tasks-container' )[ 0 ] },

  /**
   * Clear container from tasks
   *
   * @returns {void}
   */
  clearContainer() { TaskList.container.innerHTML = null },



  /**
   * Get task by it's id from current or specified tab
   *
   * @param {number} taskID
   * @param {Array|null} tab
   * @returns [Array]
   */
  getTask( taskID, tab = null ) { return ( !tab && ( tab = TaskList.getCurrentTasks() ) ) && tab[ taskID ] },

  /**
   * Get tasks for current tab
   *
   * @returns {Array}
   */
  getCurrentTasks() { return TaskList.tabs[ window.state.activeTabID ] },

  /**
   * Filter tasks from current tab
   *
   * @param {string} filter
   * @returns {Array}
   */
  getTasksByFilter( filter ) { return [] },





  /**
   * Load tabs
   *
   * @param {Array} tabs
   */
  load( tabs ) { TaskList.tabs = tabs },

  /**
   * Save tabs to the localStorage
   *
   * @returns {void}
   */
  save() {
    storage.save( 'tabs', TaskList.tabs );
    render();
  },

};
