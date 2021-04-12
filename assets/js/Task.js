const Task = {

  /**
   * Handle click on task element
   *
   * @returns {void}
   */
  editHandler() { Task.edit( this.taskID ) },

  /**
   * Open popup window in new mode
   *
   * @returns {void}
   */
  create() { Popup.show() },

  /**
   * Opens popup window in edit mode and fill it with task data
   *
   * @param {number} taskID
   * @returns {void}
   */
  edit( taskID ) {
    Popup.taskID = taskID;
    Popup.show( 'edit' );
    Popup.fillWith( TaskList.getTask( taskID ) );
  },

  /**
   * Update an exiting task by it's id
   *
   * @param {number} taskID
   * @param {Object} taskData
   * @returns {boolean|Array} True if task was updated successfuly or Array with wrong fields
   */
  update( taskID, taskData ) {
    let errors = Task.check( taskData );

    let oldData = TaskList.getTask( taskID );
    if ( date( taskData.until.date, taskData.until.time ) - date( oldData.until.date, oldData.until.time ) === 0 ) {
      delete errors.date;
      delete errors.time;

      if ( errors.title || errors.subs ) return errors;
    } else {
      if ( errors ) return errors;
    }

    let oldState = oldData.completed;
    TaskList.tabs[ window.state.activeTabID ][ taskID ] = taskData;

    if ( oldState !== TaskList.tabs[ window.state.activeTabID ][ taskID ].completed ) {
      if ( taskData.completed ) Task.moveToCompleted( taskID );
      else Task.moveToActive( taskID );
    }

    TaskList.save();
    render();

    return { success: true }
  },

  /**
   * Save new task
   *
   * @param {number} taskData
   * @returns {boolean|Array} True if task was save successfuly or Array with wrong fields
   */
  save( taskData ) {
    let errors = Task.check( taskData );
    if ( errors ) return errors;

    if ( taskData.completed ) TaskList.pushCompleted( taskData );
    else TaskList.pushActive( taskData );

    TaskList.save();
    render();

    return { success: true }
  },

  /**
   * Delete task in current tab by it's id
   *
   * @param {number} taskID
   */
  delete( taskID, tab = null ) {
    let tasks = tab || TaskList.getCurrentTasks();;
    for ( let i = taskID; i < tasks.length - 1; i++ ) tasks[ i ] = tasks[ i + 1 ];
    tasks.length--;

    TaskList.save();
  },

  /**
   * Check task fields and return array of errors or false if there is no errors
   *
   * @param {Object} taskData
   * @returns {Object|boolean}
   */
  check( taskData ) {
    let errors = {}, errorsCount = 0;

    if ( !taskData.title ) { errors.title = true; errorsCount++; }
    if ( taskData.until.time && !taskData.until.date ) { errors.date = true; errorsCount++; }
    if ( taskData.until.date ) {
      if ( date( taskData.until.date, taskData.until.time || null ) <= new Date() ) {
        errors.date = true;
        errors.time = true;
        errorsCount++;
      }
    }

    each( taskData.subs, ( sub, id ) => {
      if ( !sub.title ) {
        if ( !errors.subs ) errors.subs = [];
        errors.subs.push( id );
        errorsCount++;
      }
    } );

    return errorsCount ? errors : false;
  },

  /**
   * Check if task may be set as completed
   *
   * @param {Object} taskData
   * @returns {boolean}
   */
  mayBeCompleted( taskData ) {
    let may = true;
    each( taskData.subs, el => may = may && el.completed );

    return may
  },

  /**
   * Get task status and class for status to highlight it
   *
   * @param {Object} taskData
   * @returns {Object}
   */
  status( taskData ) {
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
  },

  moveToCompleted( taskID ) {
    TaskList.pushCompleted( TaskList.getTask( taskID ) );
    Task.delete( taskID, TaskList.getCurrentTasks() );
  },

  moveToActive( taskID ) {
    TaskList.pushActive( TaskList.getTask( taskID ) );
    Task.delete( taskID, TaskList.getCurrentTasks() );
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
          <input type="checkbox" class="task__completed"
            ${Task.mayBeCompleted( taskData ) ? '' : 'disabled'}
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
        <input type="checkbox" class="popup__sub-completed" ${subData.completed ? 'checked' : ''}>
        <div class="_mx _grow">${subData.title}</div>
      </div>
    `);
  },

  /**
   * Change sub's completed state
   *
   * @returns {void}
   */
  changeSubState() {
    let parentTask = TaskList.getTask( this.parentID );
    let sub = parentTask.subs[ this.taskID ];
    sub.completed = this.checked;

    if ( !sub.completed && parentTask.completed ) {
      parentTask.completed = false;
      Task.moveToActive( this.parentID )
    }

    TaskList.save();
    render();
  },

  /**
   * Change task's completed state
   *
   * @returns {void}
   */
  changeState() {
    let task = TaskList.getTask( this.taskID );
    task.completed = this.checked;

    if ( task.completed ) Task.moveToCompleted( this.taskID )
    else Task.moveToActive( this.taskID )

    TaskList.save();
    render();
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

    let taskCheckbox = select( '.task__completed', taskElement )[ 0 ];
    taskCheckbox.taskID = taskID;
    taskCheckbox.addEventListener( 'click', Task.changeState );
    let taskInner = select( '.task__inner', taskElement )[ 0 ];
    taskInner.taskID = taskID;
    taskInner.addEventListener( 'click', function ( evt ) {
      if ( !evt.target.matches( '.task__completed' ) ) Task.editHandler.call( this )
    } );

    let subContainer = select( '.task__subs-container', taskElement )[ 0 ];
    each( taskData.subs, ( subData, subID ) => {
      let checkbox = select( '.popup__sub-completed', append( subContainer, Task.createSubElement( subData ) ) )[ 0 ];
      checkbox.parentID = taskID;
      checkbox.taskID = subID;
      checkbox.addEventListener( 'click', Task.changeSubState );
    } );

    TaskList.container.append( taskElement );
  },

};
