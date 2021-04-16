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
  static create() { Popup.show() }

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
   * @param {Object} taskData
   * @returns {boolean|Object} True if task was updated successfully or Array with wrong fields
   */
  static update( taskID, taskData ) {
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
    TaskList.tabs[ state.activeTabID ][ taskID ] = taskData;

    if ( oldState !== TaskList.tabs[ state.activeTabID ][ taskID ].completed ) {
      if ( taskData.completed ) Task.moveToCompleted( taskID );
      else Task.moveToActive( taskID );
    }

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
    let errors = Task.check( taskData );
    if ( errors ) return errors;

    if ( taskData.completed ) TaskList.pushCompleted( taskData );
    else TaskList.pushActive( taskData );

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
   * @returns {ChildNode}
   */
  static createElement( taskData ) {
    return create( `
      <div class="task">
        <div class="task__inner row _justify-evenly _align-center _py-2 _px-3">
          <label class="checkbox ${taskData.completed ? 'checkbox_checked' : ''}">
            <input type="checkbox" class="task__completed" hidden
              ${Task.mayBeCompleted( taskData ) ? '' : 'disabled'}
              ${taskData.completed ? 'checked' : ''}>
          </label>
          <div class="task__body sm:col lg:row _justify-between _grow _ml-2">
            <div class="task__title _text-semi-bold _grow">${taskData.title}</div>
            <div class="sm:_mt-1 lg:_ml-2 _text-semi-bold ${taskData.statusClass}">${taskData.status}</div>
          </div>
        </div>
        ${taskData.hasSubs ? `<div class="task__subs-container _mt-1 _py-3 _pl-1"></div>` : ''}
      </div>
    `);
  }

  /**
   * Create task's sub element which can be inserted to the task element
   *
   * @param {Object} subData
   * @returns {ChildNode}
   */
  static createSubElement( subData ) {
    return create( `
      <div class="task__sub row _justify-evenly _align-center _py-2 _px-3">
        <label class="checkbox ${subData.completed ? 'checkbox_checked' : ''}">
          <input type="checkbox" class="popup__sub-completed" hidden ${subData.completed ? 'checked' : ''}>
        </label>
        <div class="_mx-2 _grow">${subData.title}</div>
      </div>
    `);
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

    if ( !sub.completed && parentTask.completed ) {
      parentTask.completed = false;
      Task.moveToActive( this.parentID )
    }

    TaskList.save();
    render();
  }

  /**
   * Change task's completed state
   *
   * @returns {void}
   */
  static changeState() {
    let task = TaskList.getTask( this.taskID );
    task.completed = this.checked;

    if ( task.completed ) Task.moveToCompleted( this.taskID )
    else Task.moveToActive( this.taskID )

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
   * @param {number} taskID
   * @returns {Object|boolean}
   */
  static matchFilter( taskData, filters, taskID ) {
    let foundFilters = 0,
      task = Task.clone( taskData );

    task.id = taskID;

    each( filters, filter => {
      let found = false;
      let regexp = new RegExp( `(${filter})`, 'gi' );

      found = found || ( task.title.match( regexp ) && !!( task.title = task.title.replaceAll( regexp, '<span class="_text-green">$&</span>' ) ) );
      found = found || ( Task.status( task ).status.match( regexp ) );
      if ( task.until.date ) {
        let untilDate = date( task.until.date ).toLocaleDateString();
        found = found || ( untilDate.match( regexp ) );
        task.until.time && ( found = found || ( task.until.time.match( regexp ) ) );
      }

      each( task.subs, sub => {
        let foundInSub = !!sub.title.match( regexp );
        if (foundInSub) sub.title = sub.title.replaceAll( regexp, '<span class="_text-green">$&</span>' );
        found = true;
      } );

      if ( found ) foundFilters++;
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
    taskID = taskData.id || taskID;
    taskData.hasSubs = !!taskData.subs.length;
    Object.assign( taskData, Task.status( taskData ) );
    let taskElement = Task.createElement( taskData );

    select( '.task__completed', taskElement )[ 0 ].taskID = taskID;
    select( '.checkbox', taskElement )[ 0 ].addEventListener( 'click', function () { Task.changeState.call( select('.task__completed', this )[0] ) } );
    let taskInner = select( '.task__inner', taskElement )[ 0 ];
    taskInner.taskID = taskID;
    taskInner.addEventListener( 'click', function ( evt ) {
      if ( !evt.target.matches( '.checkbox' ) && !evt.target.matches( '.task__completed' ) ) Task.editHandler.call( this )
    } );

    let subContainer = select( '.task__subs-container', taskElement )[ 0 ];
    each( taskData.subs, ( subData, subID ) => {
      let checkbox = select( '.popup__sub-completed', append( subContainer, Task.createSubElement( subData ) ) )[ 0 ];
      checkbox.parentID = taskID;
      checkbox.taskID = subID;
      checkbox.addEventListener( 'click', Task.changeSubState );
    } );

    TaskList.container.append( taskElement );
  }

}
