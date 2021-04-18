class Task {

  /**
   * Handle click on task element
   *
   * @returns {void}
   */
  static editHandler() { Task.edit( this.taskID ) }

  /**
   * Open popup window in new mode
   *
   * @returns {void}
   */
  static createNew() { Popup.show() }

  /**
   * Opens popup window in edit mode and fill it with task data
   *
   * @param {number} taskID
   * @returns {void}
   */
  static edit( taskID ) {
    Popup.taskID = taskID;
    Popup.show( 'edit' );
    Popup.fillWith( TaskList.getTask( taskID ) );
  }

  /**
   * Update an exiting task by it's id
   *
   * @param {number} taskID
   * @param {Object} newTaskData
   * @returns {Object} True if task was updated successfully or Array with wrong fields
   */
  static update( taskID, newTaskData ) {
    let validate = Task.check( newTaskData );

    let taskData = TaskList.getTask( taskID );

    // If time wasn't changed
    if ( taskData.until.date && newTaskData.until.date && date( newTaskData.until.date, newTaskData.until.time ) - date( taskData.until.date, taskData.until.time ) === 0 ) {
      !validate && ( validate = { errors: {} } );
      validate.errors.date = false;
      validate.errors.time = false;

      if ( validate.errors.title || validate.errors.subs ) return validate;
    } else if ( validate.errors ) return validate;

    let oldCompletedState = taskData.completed;
    taskData = TaskList.replace( taskID, newTaskData );

    if ( oldCompletedState !== taskData.completed )
      taskData.completed
        ? Task.moveToCompleted( taskID )
        : Task.moveToActive( taskID );

    TaskList.save();
    render();

    return { success: true }
  }

  /**
   * Save new task
   *
   * @param {Object} taskData
   * @returns {boolean|Object} True if task was save successfully or Array with wrong fields
   */
  static save( taskData ) {
    let validate = Task.check( taskData );
    if ( validate.errors ) return validate;

    taskData.completed
      ? TaskList.pushCompleted( taskData )
      : TaskList.pushActive( taskData );

    TaskList.save();
    render();

    return { success: true }
  }

  /**
   * Delete task in current tab by it's id
   *
   * @param {number} taskID
   * @param {Object[]|null} tab
   */
  static delete( taskID, tab = null ) {
    let tasks = tab || TaskList.getCurrentTasks();
    for ( let i = taskID; i < tasks.length - 1; i++ ) tasks[ i ] = tasks[ i + 1 ];
    tasks.length--;

    TaskList.save();
  }

  /**
   * Check task fields and return array of errors or false if there is no errors
   *
   * @param {Object} taskData
   * @returns {Object|boolean}
   */
  static check( taskData ) {
    let errors = {};

    if ( !taskData.title ) errors.title = true;
    if ( taskData.until.time && !taskData.until.date ) errors.date = true;
    if (
      taskData.until.date
      && date( taskData.until.date, taskData.until.time || null ) <= new Date()
    ) errors.date = errors.time = true;

    each( taskData.subs, ( sub, id ) => {
      if ( !sub.title ) {
        if ( !errors.subs ) errors.subs = [];
        errors.subs.push( id );
      }
    } );

    return Object.keys( errors ).length ? { errors: errors } : false;
  }

  /**
   * Check if task may be set as completed
   *
   * @param {Object} taskData
   * @returns {boolean}
   */
  static mayBeCompleted( taskData ) {
    let may = true;
    each( taskData.subs, el => may = may && el.completed );

    return may
  }

  /**
   * Get task status and class for status to highlight it
   *
   * @param {Object} taskData
   * @returns {Object}
   */
  static status( taskData ) {
    let statusData = { status: '', statusClass: '_text-muted' };

    if ( !taskData.until.date ) return statusData;

    let untilDate = date( taskData.until.date, taskData.until.time );

    if ( untilDate < new Date() ) return {
      status: 'Просрочено',
      statusClass: '_text-red',
    }

    untilDate = date( taskData.until.date );
    let dayDiff = msToDays( untilDate - new Date() );
    if ( dayDiff < 1 ) {
      statusData.status = 'Сегодня';
      statusData.statusClass = '_text-green';
    }
    else if ( dayDiff < 2 ) statusData.status = 'Завтра';
    else if ( dayDiff < 3 ) statusData.status = 'Послезавтра';
    else statusData.status = `Через ${Math.floor( dayDiff )} дней`;

    return statusData;
  }

  static moveToCompleted( taskID ) {
    TaskList.pushCompleted( TaskList.getTask( taskID ) );
    Task.delete( taskID, TaskList.getCurrentTasks() );
  }

  static moveToActive( taskID ) {
    TaskList.pushActive( TaskList.getTask( taskID ) );
    Task.delete( taskID, TaskList.getCurrentTasks() );
  }

  /**
   * Create task element which can be inserted to the page
   *
   * @param {Object} taskData
   * @param {Number} taskID
   * @returns {ChildNode}
   */
  static createElement( taskData, taskID ) {
    let hasSubs = !!taskData.subs.length,
      mayBeCompleted = Task.mayBeCompleted( taskData ),
      { status, statusClass } = Task.status( taskData );

    let task = create( `
      <div class="task">
        <div class="task__inner row _justify-evenly _align-center">
          <label class="checkbox">
            <input type="checkbox" class="task__completed input_checkbox" hidden>
          </label>
          <div class="task__body sm:col lg:row _justify-between">
            <div class="task__title">${taskData.title}</div>
            <div class="tesk__status sm:_mt-1 lg:_ml-2 ${statusClass}">${status}</div>
          </div>
        </div>
      </div>
    `);

    let label = select( '.checkbox', task )[ 0 ];
    let checkbox = select( '.input_checkbox', task )[ 0 ];
    checkbox.taskID = taskID;
    checkbox.addEventListener( 'change', Task.changeState );

    if ( taskData.completed ) {
      addClass( label, 'checkbox_checked' );
      checkbox.checked = true;
    }
    if ( !mayBeCompleted ) {
      addClass( label, 'checkbox_disabled' );
      checkbox.disabled = true;
    }

    let taskBody = select( '.task__body', task )[ 0 ];
    taskBody.taskID = taskID;
    taskBody.addEventListener( 'click', Task.editHandler );

    if ( hasSubs ) {
      let subContainer = append( task, create( '<div class="task__subs-container"></div>' ) );
      each(
        taskData.subs,
        ( subData, subID ) => append( subContainer, Task.createSubElement( subData, subID, taskID ) )
      );
    }

    return task;
  }

  /**
   * Create task's sub element which can be inserted to the task element
   *
   * @param {Object} subData
   * @param {Number} subID
   * @param {Object} parentID
   * @returns {ChildNode}
   */
  static createSubElement( subData, subID, parentID ) {
    let sub = create( `
      <div class="sub-task row _justify-evenly _align-center">
        <label class="checkbox">
          <input type="checkbox" class="sub-task__completed input_checkbox" hidden>
        </label>
        <div class="sub-task__title">${subData.title}</div>
      </div>
    `);

    let label = select( '.checkbox', sub )[ 0 ];
    let checkbox = select( '.input_checkbox', sub )[ 0 ];
    checkbox.parentID = parentID;
    checkbox.taskID = subID;
    checkbox.addEventListener( 'click', Task.changeSubState );

    if ( subData.completed ) {
      checkbox.checked = true;
      addClass( label, 'checkbox_checked' );
    }

    return sub;
  }

  /**
   * Change sub's completed state
   *
   * @returns {void}
   */
  static changeSubState() {
    let parentTask = TaskList.getTask( this.parentID );
    let sub = parentTask.subs[ this.taskID ];
    sub.completed = this.checked;

    // Move to active if the sub became false and the parent task has been completed
    if ( !sub.completed && parentTask.completed ) {
      parentTask.completed = false;
      Task.moveToActive( this.parentID );
    }

    TaskList.save();
    render();
  }

  /**
   * Change task's completed state
   *
   * @returns {void}
   * @this {ChildNode} Task's checkbox
   */
  static changeState() {
    let task = TaskList.getTask( this.taskID );
    task.completed = this.checked;

    task.completed
      ? Task.moveToCompleted( this.taskID )
      : Task.moveToActive( this.taskID );

    TaskList.save();
    render();
  }

  /**
   * Get the same task object but with different reference
   *
   * @param {Object} taskData
   * @returns {Object}
   */
  static clone( taskData ) {
    let task = {};
    Object.assign( task, taskData );

    task.subs = [];
    each( taskData.subs, subData => {
      let sub = {};
      Object.assign( sub, subData );
      task.subs.push( sub );
    } );

    return task
  }

  /**
   * Check if task match the filter and highlight entries
   *
   * @param {Object} taskData
   * @param {Array} filters
   * @returns {Object|boolean}
   */
  static matchFilter( taskData, filters ) {
    let foundFilters = 0,
      // Clone the task to avoid change the saved data
      task = Task.clone( taskData );

    each( filters, filter => {
      let found = false;
      let regexp = new RegExp( `(${filter})`, 'gi' );

      if ( task.title.match( regexp ) ) { found = !!( task.title = task.title.replaceAll( regexp, '<span class="_text-green">$&</span>' ) ) }
      if ( Task.status( task ).status.match( regexp ) ) found = true;
      if ( task.until.date ) {
        if ( date( task.until.date ).toLocaleDateString().match( regexp ) ) found = true;
        if ( task.until.time && task.until.time.match( regexp ) ) found = true;
      }

      each( task.subs, sub => {
        if ( !!sub.title.match( regexp ) ) found = !!( sub.title = sub.title.replaceAll( regexp, '<span class="_text-green">$&</span>' ) )
      } );

      foundFilters += +found;
    } );

    return foundFilters === filters.length ? task : false
  }

  /**
   * Render task to the page from taskData
   *
   * @param {Object} taskData
   * @param {number} taskID
   * @returns {void}
   */
  static render( taskData, taskID ) {
    // If the tasks were filtered, it retains the original task id otherwise the original id is passed as parameter
    taskID = taskData.id || taskID;
    let task = Task.createElement( taskData, taskID );

    TaskList.container.append( task );
  }

}
