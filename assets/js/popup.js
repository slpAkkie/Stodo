const Popup = {

  /**
   * In which mode opened popup
   *
   * @var {string}
   */
  mode: 'hidden',

  /**
   * Which task is opened
   *
   * @var {number|null}
   */
  taskID: null,

  /**
   * Get root popup element
   *
   * @var {Element}
   */
  get root() { return select( '.popup' )[ 0 ] },

  /** @var {string} */
  get title() { return select( '#popup-title' )[ 0 ].value },
  set title( value ) { select( '#popup-title' )[ 0 ].value = value },

  /** @var {string} */
  get date() { return select( '#popup-date' )[ 0 ].value || null },
  set date( value ) { select( '#popup-date' )[ 0 ].value = value },

  /** @var {string} */
  get time() { return select( '#popup-time' )[ 0 ].value || null },
  set time( value ) { select( '#popup-time' )[ 0 ].value = value },

  /** @var {string} */
  get completed() { return select( '#popup-completed' )[ 0 ].checked },
  set completed( value ) { select( '#popup-completed' )[ 0 ].checked = value },

  /** @var {string} */
  get subs() {
    let subTasks = select( '.popup__sub' ), subsData = [];

    each( subTasks, sub => subsData.push( {
      title: select( '.popup__sub-title', sub )[ 0 ].value,
      completed: select( '.popup__sub-completed', sub )[ 0 ].checked,
    } ) );

    return subsData
  },
  set subs( value ) {
    Popup.getSubContainer().innerHTML = null;

    each( value, sub => {
      Popup.renderSub( Popup.createSub( sub ) )
    } );
  },

  /**
   * Get container for sub tasks
   *
   * @returns {Element}
   */
  getSubContainer() { return select( '.popup__subs-container' )[ 0 ] },

  /**
   * Create sub task
   *
   * @param {Object|null} subData
   * @returns {Element}
   */
  createSub( subData = null ) {
    subData = subData ?? { title: '', completed: false };
    let sub = create( `
      <div class="popup__sub row _justify-evenly _align-center">
        <input type="checkbox" class="popup__sub-completed" ${subData.completed ? 'checked' : ''}>
        <input type="text" class="popup__sub-title input _mx _w-100" value="${subData.title}">
        <div class="popup__sub-remove button button_danger">Удалить</div>
      </div>
    `);

    select( '.popup__sub-completed', sub )[ 0 ].addEventListener( 'click', Popup.changeSubState );
    select( '.popup__sub-remove', sub )[ 0 ].addEventListener( 'click', Popup.removeSub );
    return sub;
  },

  renderSub( subElement ) {
    append( Popup.getSubContainer(), subElement );
    return subElement
  },

  /**
   * Add sub task to the popup
   *
   * @returns {void}
   */
  addSub() {
    Popup.renderSub( Popup.createSub() );
    Popup.completed = false;
    select( '#popup-completed' )[ 0 ].disabled = true;
  },

  /**
   * Remove sub task
   *
   * @returns {void}
   */
  removeSub() {
    parent( this ).remove();
    if ( !select( '.popup__sub' ).length ) select( '#popup-completed' )[ 0 ].disabled = false;
  },

  /**
   * Change sub's completed state
   *
   * @returns {void}
   */
  changeSubState() {
    if ( !Task.mayBeCompleted( { subs: Popup.subs } ) ) {
      Popup.completed = false;
      select( '#popup-completed' )[ 0 ].disabled = true;
    } else {
      select( '#popup-completed' )[ 0 ].disabled = false;
    }
  },

  /**
   * Render button to the controls container
   *
   * @param {Element} button
   * @returns {Element}
   */
  renderButton( button ) {
    select( '#js-popup-controls' )[ 0 ].append( button );
    return button
  },

  /**
   * Render delete button
   *
   * @returns {Element}
   */
  renderDeleteButton() { return Popup.renderButton( create( `<div class="button button_danger sm:_text-center sm:_mt-1 lg:_ml-2" id="popup-delete">Удалить</div>` ) ) },

  /**
   * Render save button
   *
   * @returns {Element}
   */
  renderSaveButton() { return Popup.renderButton( create( `<div class="button button_success sm:_text-center sm:_mt-1 lg:_ml-2" id="popup-save">Сохранить</div>` ) ) },

  /**
   * Handle request to delete task
   *
   * @returns {void}
   */
  deleteHandler() {
    if ( !confirm( 'Вы действительно хотите удалить эту задачу?' ) ) return;
    Task.delete( Popup.taskID );
    Popup.hide();
  },

  /**
   * Handle request to save task
   *
   * @returns {void}
   */
  saveHandler() {
    let response = Popup.mode === 'new'
      ? Task.save( Popup.getData() )
      : Task.update( Popup.taskID, Popup.getData() );

    if ( response.success ) return Popup.hide();

    // TODO: Highlight wrong fields
    Popup.setErrors( response );
  },

  /**
   * Show popup to create or edit task
   *
   * @param {string} mode Create new task or edit exiting. Default: new
   * @returns {void}
   */
  show( mode = 'new' ) {
    if ( ( Popup.mode = mode ) === 'edit' ) Popup.renderDeleteButton().addEventListener( 'click', Popup.deleteHandler );
    Popup.renderSaveButton().addEventListener( 'click', Popup.saveHandler );
    addClass( Popup.root, 'popup_shown' );
  },

  /**
   * Hide task
   *
   * @returns {void}
   */
  hide() {
    Popup.mode = 'hidden';
    Popup.taskID = null;
    removeClass( Popup.root, 'popup_shown' );
    Popup.clear();
  },

  /**
   * Get data from popup
   *
   * @returns {Object}
   */
  getData() {
    return {
      title: Popup.title,
      until: { date: Popup.date, time: Popup.time },
      completed: Popup.completed,
      subs: Popup.subs,
    }
  },

  /**
   * Clear all fields and generated buttons
   *
   * @returns {void}
   */
  clear() {
    Popup.title = null;
    Popup.date = null;
    Popup.time = null;
    Popup.completed = false;
    Popup.subs = [];
    select( '#js-popup-controls' )[ 0 ].innerHTML = null;
    Popup.resetErrors();
  },

  /**
   * Highlighy wrong fields
   *
   * @param {Array} errors
   */
  setErrors( errors ) {
    Popup.resetErrors();
    if ( errors.title ) addClass( select( '#popup-title' )[ 0 ], 'input_wrong' );
    if ( errors.date ) addClass( select( '#popup-date' )[ 0 ], 'input_wrong' );
    if ( errors.time ) addClass( select( '#popup-time' )[ 0 ], 'input_wrong' );
    if ( errors.subs ) {
      let subElements = select( '.popup__sub-title', Popup.root );
      each( errors.subs, id => addClass( subElements[ id ], 'input_wrong' ) );
    }
  },

  /**
   * Remove all highlight from inputs
   *
   * @returns {void}
   */
  resetErrors() { each( select( '.input_wrong', Popup.root ), input => removeClass( input, 'input_wrong' ) ) },

  /**
   * Fill popup fields with task data
   *
   * @param {Object} taskData
   */
  fillWith( taskData ) {
    Popup.title = taskData.title;
    Popup.date = taskData.until.date;
    Popup.time = taskData.until.time;
    Popup.completed = taskData.completed;
    Popup.subs = taskData.subs;

    select( '#popup-completed' )[ 0 ].disabled = !Task.mayBeCompleted( taskData );
  },

};
