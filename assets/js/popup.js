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

  /**
   * @var {string}
   */
  get title() { return select( '#popup-title' )[ 0 ].value },
  set title( v ) { },

  /**
   * @var {string}
   */
  get date() { return select( '#popup-date' )[ 0 ].valueAsDate },
  set date( v ) { },

  /**
   * @var {string}
   */
  get time() { return select( '#popup-time' )[ 0 ].value },
  set time( v ) { },

  /**
   * @var {string}
   */
  get completed() { return select( '#popup-completed' )[ 0 ].checked },
  set completed( v ) { },

  /**
   * @var {string}
   */
  get subs() { },
  set subs( v ) { },

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
    return create( `
      <div class="popup__sub row _justify-evenly _align-center">
        <input type="checkbox" class="popup__sub-completed" ${subData.completed ? 'checked' : ''}>
        <input type="text" class="input _mx _w-100" value="${subData.title}">
        <div class="popup__sub-remove button button_danger">Удалить</div>
      </div>
    `);
  },

  /**
   * Add sub task to the popup
   */
  addSub() {
    select(
      '.popup__sub-remove',
      append( Popup.getSubContainer(), Popup.createSub() )
    )[ 0 ].addEventListener( 'click', Popup.removeSub );
  },

  removeSub() { parent( this ).remove() },

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

    if ( reponse === true ) return Popup.hide();

    // TODO: Highlight wrong fields
    console.log( response );
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
  },

  /**
   * Get data from popup
   *
   * @returns {Object}
   */
  getData() {
    let data = {
      title: Popup.title,
      until: { date: Popup.date, time: Popup.time },
      completed: Popup.completed,
      subs: Popup.subs,
    };
  },










  fillWith( taskData ) {

  },
  clear() { },
  resetErrors() { },
  setError( field ) { },

  checkFields() { },

};
