const Task = {

  create() {
    window.state.openedMode = 'new';
    Popup.show();
  },
  add() { },
  edit( id ) {
    console.log( 'Редакировать ' + id );
  },
  delete() { },
  getStatus( task ) {
    return [ 'Скоро', '_text-muted' ];
  },
  changeCompletedState( checkbox ) {
    let completed = checkbox.checked;

    if ( checkbox.parentID !== undefined ) {
      if ( !( TaskList.allCurrent()[ checkbox.parentID ].subs[ checkbox.subID ].completed = completed ) )
        Task.setUncompleted( checkbox.parentID );
    }
    else {
      if ( completed ) Task.setCompleted( checkbox.taskID );
      else Task.setUncompleted( checkbox.taskID );
    }

    TaskList.save();
  },
  setCompleted( id ) {
    TaskList.allCurrent()[ id ].completed = true;
    TaskList.moveToCompleted( id );
  },
  setUncompleted( id ) {
    TaskList.allCurrent()[ id ].completed = false;
    TaskList.moveToActive( id );
  },
  allSubsCompleted( obj ) {
    let allSubsCompleted = true;
    obj.subs.forEach( el => allSubsCompleted = el.completed && allSubsCompleted )

    return allSubsCompleted;
  },

  render( obj, id ) {
    let [ status, statusClass ] = this.getStatus( obj );
    let withSubs = !!obj.subs.length;

    let task = append( TaskList.taskContainer, create( `
      <div class="task">
        <div class="task__inner row _justify-evenly _align-center _py-2 _px-3 _rounded">
          <input type="checkbox" class="popup__task-completed" ${Task.allSubsCompleted( obj ) ? '' : 'disabled'} ${obj.completed ? 'checked' : ''}>
          <div class="task__title _text-bold _mx-2 _grow">${obj.title}</div>
          <div class="_text-semi-bold ${statusClass}">${status}</div>
        </div>
        ${withSubs ? `<div class="task__subs-container _mt-1 _py-3 _pl-1"></div>` : ''}
      </div>
    `) )

    let subContainer = sel( '.task__subs-container', task )[ 0 ];
    obj.subs.forEach( ( sub, subID ) => {
      let subCheckbox = sel( '.popup__sub-completed', append( subContainer, create( `
        <div class="task__sub row _justify-evenly _align-center _py-2 _px-3 _rounded">
          <input type="checkbox" class="popup__sub-completed" ${sub.completed ? 'checked' : ''}>
          <div class="_text-bold _mx-2 _grow">${sub.title}</div>
        </div>
      `) ) )[ 0 ];
      subCheckbox.parentID = id;
      subCheckbox.subID = subID;
    } );

    sel( '.popup__task-completed', task )[ 0 ].taskID = id;

    task.addEventListener( 'click', function ( evt ) {
      if ( evt.target.matches( '.popup__task-completed' ) || evt.target.matches( '.popup__sub-completed' ) ) Task.changeCompletedState( evt.target );
      else if ( evt.target.matches( '.task__inner' ) || evt.target.matches( '.task__title' ) ) Task.edit( id );
    } );
  },

};
