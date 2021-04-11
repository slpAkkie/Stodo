const Task = {

  create() {
    window.state.openedMode = 'new';
    Popup.show();
  },
  add() { },
  delete() { },
  getStatus( task ) {
    return [ 'Скоро', '_text-muted' ];
  },
  changeCompletedState() { },
  setCompleted() { },
  setUncompleted() { },
  allSubsCompleted() { },

  render( obj, id ) {
    let [ status, statusClass ] = this.getStatus( obj );
    let withSubs = !!obj.subs.length;

    let task = append( TaskList.taskContainer, create( `
      <div class="task">
        <div class="task__inner row _justify-evenly _align-center _py-2 _px-3 _rounded">
          <input type="checkbox" class="popup__task-completed">
          <div class="_text-bold _mx-2 _grow">${obj.title}</div>
          <div class="_text-semi-bold ${statusClass}">${status}</div>
        </div>
        ${withSubs ? `<div class="task__subs-container _mt-1 _py-3 _pl-1"></div>` : ''}
      </div>
    `) )

    let subContainer = sel( '.task__subs-container', task )[ 0 ];
    obj.subs.forEach( ( sub, id ) => {
      append( subContainer, create( `
        <div class="task__sub row _justify-evenly _align-center _py-2 _px-3 _rounded">
          <input type="checkbox" class="popup__sub-completed" ${sub.completed ? 'checked' : ''}>
          <div class="_text-bold _mx-2 _grow">${sub.title}</div>
        </div>
      `) )
    } );
  },

};
