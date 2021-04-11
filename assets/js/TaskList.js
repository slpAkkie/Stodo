let TaskList = {

  active: [],
  completed: [],

  get taskContainer() { return sel( '.tasks-container' )[ 0 ] },
  getTask( id, tab = null ) {
    if ( !tab ) tab = this.getCurrent();

    return tab[ id ];
  },

  allCurrent() { return this[ window.state.active_tab ] || [] },
  getCurrent() {
    return window.state.filterQuery ? TaskList.filter( window.state.filterQuery ) : this.allCurrent();
  },
  allInactive() { return this[ window.state.active_tab === 'active' ? 'completed' : 'active' ] || [] },
  remove( id ) { },
  move( id, to ) { },
  moveToActive( id ) {
    let task = this.getTask( id );
    let tab = this.allInactive();

    tab.unshift( task );
    tab = this.allCurrent();
    for ( let i = id; i < tab.length - 1; i++ ) tab[ i ] = tab[ i + 1 ];
    tab.length--;
  },
  moveToCompleted( id ) {
    let task = this.getTask( id );
    let tab = this.allInactive();

    tab.unshift( task );
    tab = this.allCurrent();
    for ( let i = id; i < tab.length - 1; i++ ) tab[ i ] = tab[ i + 1 ];
    tab.length--;
  },
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

  load( tabs ) {
    this.active = tabs.active;
    this.completed = tabs.completed;
  },
  save() {
    storage.save( 'tabs', { active: TaskList.active, completed: TaskList.completed } );
    render();
  },

};
