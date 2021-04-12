const Task = {

  /**
   * Handle click on task element
   *
   * @returns {void}
   */
  editHandler() { Task.edit( this.taskID ) },

  /**
   * Opens popup window in edit mode and fill it with task data
   *
   * @param {number} taskID
   * @returns {void}
   */
  edit( taskID ) {
    Popup.show( 'edit' );
    Popup.fillWith( TaskList.getTask( taskID ) );
  },

  /**
   * Update an exiting task by it's id
   *
   * @param {number} taskID
   * @returns {boolean|Array} True if task was updated successfuly or Array with wrong fields
   */
  update( taskID, taskData ) {
    TaskList.getTask( taskID ) = taskData;

    // TODO: check if it has been completed

    TaskList.save();
    render();

    return true;
  },

  /**
   * Delete task in current tab by it's id
   *
   * @param {number} taskID
   */
  delete( taskID ) {
    let tasks = TaskList.getCurrentTasks();
    for ( let i = taskID; i < tasks.length - 1; ) tasks[ i ] = tasks[ ++i ];
    tasks.length--;
  },

  /**
   * Check if task may be set as completed
   *
   * @param {Object} taskData
   * @returns {boolean}
   */
  manBeCompleted( taskData ) {
    let may = true;
    each( taskData.subs, el => may = may && el.completed );

    return may
  },

  /**
   * Get task status and class for status to highlight it
   *
   * @param {Object} task
   * @returns {Object}
   */
  status( task ) {
    return {
      status: 'Скоро',
      statusClass: '_text-muted',
    };
  },

  /**
   * Create task element which can be inserted to the page
   *
   * @param {Object} taskData
   * @returns {ChildNode}
   */
  createElement( taskData ) {
    return create( `
      <div class="task">
        <div class="task__inner row _justify-evenly _align-center _py-2 _px-3">
          <input type="checkbox" class="popup__task-completed"
            ${Task.manBeCompleted( taskData ) ? '' : 'disabled'}
            ${taskData.completed ? 'checked' : ''}>
          <div class="task__body sm:col lg:row _justify-between _grow _ml-2">
            <div class="task__title _text-semi-bold _grow">${taskData.title}</div>
            <div class="sm:_mt-1 lg:_ml-2 _text-semi-bold ${taskData.statusClass}">${taskData.status}</div>
          </div>
        </div>
        ${taskData.hasSubs ? `<div class="task__subs-container _mt-1 _py-3 _pl-1"></div>` : ''}
      </div>
    `);
  },

  /**
   * Create task's sub element which can be inserted to the task element
   *
   * @param {Object} subData
   * @returns {ChildNode}
   */
  createSubElement( subData ) {
    return create( `
      <div class="task__sub row _justify-evenly _align-center _py-2 _px-3">
        <input type="checkbox" class="popup__sub-completed" ${subData.checked}>
        <div class="_mx _grow">${subData.title}</div>
      </div>
    `);
  },

  /**
   * Render task to the page from taskData
   *
   * @param {Object} taskData
   * @param {number} taskID
   * @returns {void}
   */
  render( taskData, taskID ) {
    taskData.hasSubs = !!taskData.subs.length;
    Object.assign( taskData, Task.status( taskData ) );
    let taskElement = Task.createElement( taskData );

    select( '.popup__task-completed', taskElement )[ 0 ].taskID = taskID;
    let taskBody = select( '.task__body', taskElement )[ 0 ];
    taskBody.taskID = taskID;
    taskBody.addEventListener( 'click', Task.editHandler );

    let subContainer = select( '.task__subs-container', taskElement )[ 0 ];
    each( taskData.subs, ( subData, subID ) => {
      let checkbox = select( '.popup__sub-completed', append( subContainer, Task.createSubElement( subData ) ) )[ 0 ];
      checkbox.parentID = taskID;
      checkbox.taskID = subID;
    } );

    TaskList.container.append( taskElement );
  },

};
