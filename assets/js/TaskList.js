let TaskList = {

  active: [],
  completed: [],

  get taskContainer() { return sel( '.tasks-container' )[ 0 ] },

  allCurrent() { return this[ window.state.active_tab ] || [] },
  getCurrent() {
    return window.state.filterQuery ? TaskList.filter( window.state.filterQuery ) : this.allCurrent();
  },
  remove( id ) { },
  move( id, to ) { },
  moveToActive( id ) { },
  moveToCompleted( id ) { },
  filter( query ) {
    let filters = query.split( ' ' );
    let tasks = [];

    this.allCurrent().forEach( ( task, id ) => {
      if (
        contains( filters, task.title.split( ' ' ) )
        || contains( filters, task.until.date )
        || contains( filters, task.until.time )
        || contains( filters, Task.getStatus( task ).split( ' ' ) )
      ) return tasks.push( task );

      let isSub = false;
      task.subs.forEach( sub => {
        isSub = contains( filters, sub.title.split( ' ' ) );
      } );

      return isSub ? tasks.push( task ) : false;

    } );

    return tasks;
  },

};
