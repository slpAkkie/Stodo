class Popup {

  /**
   * In which mode opened popup
   *
   * @var {string}
   */
  static mode = 'hidden';

  /**
   * Which task is opened
   *
   * @var {number|null}
   */
  static taskID = null;

  /** @type {Element} */
  static #title = select( '#popup-title' )[ 0 ];

  /** @type {Element} */
  static #date = select( '#popup-date' )[ 0 ];

  /** @type {Element} */
  static #time = select( '#popup-time' )[ 0 ];

  /** @type {Element} */
  static #checkbox = select( '#popup-completed' )[ 0 ];

  /**
   * Get root popup element
   *
   * @var {Element}
   */
  static root = select( '.popup' )[ 0 ];

  /** @var {string} */
  static get title() { return Popup.#title.value }
  static set title( value ) { Popup.#title.value = value }

  /** @var {string} */
  static get date() { return Popup.#date.value || null }
  static set date( value ) { Popup.#date.value = value }

  /** @var {string} */
  static get time() { return Popup.#time.value || null }
  static set time( value ) { Popup.#time.value = value }

  /** @var {string} */
  static get completed() { return Popup.#checkbox.checked }
  static set completed( value ) { Popup.#checkbox.checked = value }

  /** @var {string} */
  static get subs() {
    let subTasks = select( '.popup__sub' ), subsData = [];

    each( subTasks, sub => subsData.push( {
      title: select( '.popup__sub-title', sub )[ 0 ].value,
      completed: select( '.popup__sub-completed', sub )[ 0 ].checked,
    } ) );

    return subsData
  }
  static set subs( value ) {
    Popup.getSubContainer().innerHTML = null;

    each( value, sub => {
      Popup.renderSub( Popup.createSub( sub ) )
    } );
  }

  /**
   * Get container for sub tasks
   *
   * @returns {Element}
   */
  static getSubContainer() { return select( '.popup__subs-container' )[ 0 ] }

  /**
   * Create sub task
   *
   * @param {Object|null} subData
   * @returns {Element}
   */
  static createSub( subData = null ) {
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
  }

  static renderSub( subElement ) {
    append( Popup.getSubContainer(), subElement );
    return subElement
  }

  /**
   * Add sub task to the popup
   *
   * @returns {void}
   */
  static addSub() {
    Popup.renderSub( Popup.createSub() );
    Popup.completed = false;
    select( '#popup-completed' )[ 0 ].disabled = true;
  }

  /**
   * Remove sub task
   *
   * @returns {void}
   */
  static removeSub() {
    parent( this ).remove();
    let popupSubs = Popup.subs;
    if ( !popupSubs.length || popupSubs.filter( popupSub => ( popupSub.completed ) ).length === popupSubs.length )
      select( '#popup-completed' )[ 0 ].disabled = false;
  }

  /**
   * Change sub's completed state
   *
   * @returns {void}
   */
  static changeSubState() {
    if ( !Task.mayBeCompleted( { subs: Popup.subs } ) ) {
      Popup.completed = false;
      select( '#popup-completed' )[ 0 ].disabled = true;
    } else {
      select( '#popup-completed' )[ 0 ].disabled = false;
    }
  }

  /**
   * Render button to the controls container
   *
   * @param {ChildNode} button
   * @returns {ChildNode}
   */
  static renderButton( button ) {
    select( '#js-popup-controls' )[ 0 ].append( button );
    return button
  }

  /**
   * Render delete button
   *
   * @returns {ChildNode}
   */
  static renderDeleteButton() { return Popup.renderButton( create( `<div class="button button_danger sm:_text-center sm:_mt-1 lg:_ml-2" id="popup-delete">Удалить</div>` ) ) }

  /**
   * Render save button
   *
   * @returns {ChildNode}
   */
  static renderSaveButton() { return Popup.renderButton( create( `<div class="button button_success sm:_text-center sm:_mt-1 lg:_ml-2" id="popup-save">Сохранить</div>` ) ) }

  /**
   * Handle request to delete task
   *
   * @returns {void}
   */
  static deleteHandler() {
    if ( !confirm( 'Вы действительно хотите удалить эту задачу?' ) ) return;
    Task.delete( Popup.taskID );
    Popup.hide();
  }

  /**
   * Handle request to save task
   *
   * @returns {void}
   */
  static saveHandler() {
    let response = Popup.mode === 'new'
      ? Task.save( Popup.getData() )
      : Task.update( Popup.taskID, Popup.getData() );

    if ( response.success ) return Popup.hide();

    Popup.setErrors( response );
  }

  /**
   * Show popup to create or edit task
   *
   * @param {string} mode Create new task or edit exiting. Default: new
   * @returns {void}
   */
  static show( mode = 'new' ) {
    if ( ( Popup.mode = mode ) === 'edit' ) Popup.renderDeleteButton().addEventListener( 'click', Popup.deleteHandler );
    Popup.renderSaveButton().addEventListener( 'click', Popup.saveHandler );
    addClass( Popup.root, 'popup_shown' );
  }

  /**
   * Hide task
   *
   * @returns {void}
   */
  static hide() {
    Popup.mode = 'hidden';
    Popup.taskID = null;
    removeClass( Popup.root, 'popup_shown' );
    Popup.clear();
  }

  /**
   * Get data from popup
   *
   * @returns {Object}
   */
  static getData() {
    return {
      title: Popup.title,
      until: { date: Popup.date, time: Popup.time },
      completed: Popup.completed,
      subs: Popup.subs,
    }
  }

  /**
   * Clear all fields and generated buttons
   *
   * @returns {void}
   */
  static clear() {
    Popup.title = null;
    Popup.date = null;
    Popup.time = null;
    Popup.completed = false;
    Popup.subs = [];
    select( '#js-popup-controls' )[ 0 ].innerHTML = null;
    Popup.resetErrors();
  }

  /**
   * Highlight wrong fields
   *
   * @param {Array} errors
   */
  static setErrors( errors ) {
    Popup.resetErrors();
    if ( errors.title ) addClass( select( '#popup-title' )[ 0 ], 'input_wrong' );
    if ( errors.date ) addClass( select( '#popup-date' )[ 0 ], 'input_wrong' );
    if ( errors.time ) addClass( select( '#popup-time' )[ 0 ], 'input_wrong' );
    if ( errors.subs ) {
      let subElements = select( '.popup__sub-title', Popup.root );
      each( errors.subs, id => addClass( subElements[ id ], 'input_wrong' ) );
    }
  }

  /**
   * Remove all highlight from inputs
   *
   * @returns {void}
   */
  static resetErrors() { each( select( '.input_wrong', Popup.root ), input => removeClass( input, 'input_wrong' ) ) }

  /**
   * Fill popup fields with task data
   *
   * @param {Object} taskData
   */
  static fillWith( taskData ) {
    Popup.title = taskData.title;
    Popup.date = taskData.until.date;
    Popup.time = taskData.until.time;
    Popup.completed = taskData.completed;
    Popup.subs = taskData.subs;

    select( '#popup-completed' )[ 0 ].disabled = !Task.mayBeCompleted( taskData );
  }

}
