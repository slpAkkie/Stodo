/** queryLight */

/**
 * Скрипты предоставлены для queryLight (ql)
 *
 * Author: Alexandr Shamanin (@slpAkkie)
 * Version: 1.0.4
 * File Version: 1.0.12
*/





/**
 * queryLight
 *
 * @param {string|Element} input Строка css селектора или DOM элемент
 * @param {Element} parent Элемент внутри которого будет производиться поиск. По умолчанию document
 *
 * @returns {Proxy} Обертка вокруг элементов
 */
function qL( input, parent = null ) {

  if ( typeof input === 'function' ) { _( document ).on( 'DOMContentLoaded', input ); return; }



  /**
   * @var {Object} queryLight Объект queryLight
   */
  let queryLight = new Object( {
    /** Поле идентификации того, что это Проксированный элемент */
    qL: true,
    _( input ) { return qL( input, this ) },

    /** Основные функции */
    addClass( classString ) { this.each( el => el.classList.add( classString ) ); return this },
    removeClass( classString ) { this.each( el => el.classList.remove( classString ) ); return this },
    toggleClass( classString ) { this.each( el => _( el ).hasClass( classString ) ? _( el ).removeClass( classString ) : _( el ).addClass( classString ) ) },
    hasClass( classString ) { return this.__elements.some( el => el.classList.contains( classString ) ) },
    on( eventName, callback ) {
      this.each( function ( el ) { el.addEventListener( eventName, callback.bind( _( this ) ) ) } );

      return this
    },
    each( callback ) { this.__elements.forEach( el => callback.call( _( el ), _( el ) ) ); return this },
    insertBefore( sibling ) {
      this.__aloneRequire();

      if ( sibling.qL ) {
        let parent = this.parent().get();

        sibling.each( ch => parent.insertBefore( ch.get(), this.get() ) );
      } else
        this.parent().get().insertBefore( sibling, this.get() );

      return sibling
    },
    insertAfter( sibling ) {
      let nextSibling = this.nextSibling;
      nextSibling
        ? this.parent.insertBefore( sibling, this.nextSibling )
        : this.parent.appendChild( sibling );

      return sibling
    },
    insert( child, multiInsert = false ) {
      !child.qL && ( child = _( child ) );

      if ( multiInsert ) {
        this.each( el => child.each( ch => el.appendChild( ch.get().cloneNode( true ) ) ) );

        return this
      } else {
        this.__aloneRequire();
        child.each( ch => this.appendChild( ch.get() ) );

        return child
      }
    },
    insertFirst( child, multiInsert = false ) {
      !child.qL && ( child = _( child ) );

      if ( multiInsert ) {
        this.each( el => child.each( ch => _( el.firstElementChild )?.insertBefore( ch.get().cloneNode( true ) ) || el.insert( ch ) ) );

        return this
      } else {
        this.__aloneRequire();
        child.each( ch => _( this.firstElementChild )?.insertBefore( ch.get() ) || this.insert( ch ) );

        return child
      }
    },
    replace( newElement ) { this.replaceWith( newElement.qL ? newElement.get() : newElement ); return newElement },
    clear() {
      this.each( el => el.innerHTML = '' );

      return this
    },
    get( index = null, as_qL = false ) { let el = ( index === null ) ? this.__elements[ 0 ] : this.__elements[ index ]; return as_qL ? qL( el ) : el },

    /** Основные геттеры */
    scrollTop() { return window.pageYOffset },
    topOffset() { return this.offsetTop },
    text( value = null ) {
      if ( value !== null ) this.each( el => el.innerText = value );

      return value || this.innerText;
    },
    len() { return this.__elements.length },
    parent( selector = null ) {
      if ( !selector ) return _( this.parentElement );

      this.__aloneRequire();
      let parent = this.parent();
      while ( !parent.matches( selector ) ) {
        if ( parent.matches( ':root' ) ) return null;

        parent = parent.parent();
      }

      return parent;
    },
    prev() { return _( this.previousElementSibling ) },
    elements() {
      this.__aloneRequire();

      const form = this.get();
      let elements = null;

      for ( let key in form.elements )
        if ( form.elements.hasOwnProperty( key ) && Number.isNaN( parseInt( key ) ) )
          elements ? elements.__push( form.elements[ key ] ) : ( elements = _( form.elements[ key ] ) );

      return elements;
    },
    formData( withGETQuery = false ) {
      let formsData = new Array();

      this.each( form => {
        if ( !( form.get() instanceof HTMLFormElement ) ) throw new Error( 'Один или более элементов не были формой' );

        let formData = new Object();
        form.elements().each( el => formData[ el.name ] = el.value );
        formsData.push( formData );
      } );

      if ( withGETQuery && this.__aloneRequire() ) return { GETQuery: GETQueryFrom( formsData[ 0 ] ), formData: formsData[ 0 ] };
      return formsData.length > 1 ? formsData : ( formsData.length === 1 ? formsData[ 0 ] : null );
    },



    /** Служебные функции */
    __aloneRequire() { if ( this.len() > 1 ) throw new Error( `Коллекция состоит из ${this.len()} элементов. Я не понимаю для какого элемента вы хотите получить значение` ); return true },
    __push( element ) {
      ( element instanceof Element || element.qL )
        && this.__elements.push( element.qL ? element.get() : element );
      return this
    },
  } );



  /** Проверка на входные параметры */
  if ( parent && parent.qL && parent.__aloneRequire() ) parent = parent.get();
  else if ( !( parent instanceof Element ) ) {
    if ( parent !== null ) throw new Error( 'Родительский элемент не был DOM элементом. Если вы использовали элемент, взятый с помощью qL убедитесь что получили конкретный DOM элемент' );
    parent = document;
  }

  if ( input && input.qL === true ) return input;

  if ( typeof input === 'string' ) queryLight.__elements = Array.from( parent.querySelectorAll( input ) );
  else if ( input instanceof Element || input instanceof Window || input instanceof Document ) queryLight.__elements = [ input ];
  else return null;
  if ( queryLight.len() === 0 ) return null;



  /** Вернем обертку над элементами */
  return new Proxy( queryLight, {
    get( target, prop, receiver ) {
      if ( !( prop in target ) ) {
        target.__aloneRequire();
        target = target.get();
        let gotten = Reflect.get( target, prop );

        if ( typeof gotten === 'function' ) return gotten.bind( target );
        else return gotten;
      }

      return Reflect.get( target, prop, receiver );
    },

    set( target, name, val ) {
      if ( !( name in target ) ) {
        target.__aloneRequire();
        target = target.get();
        return Reflect.set( target, name, val );
      }

      return Reflect.set( target, name, val );
    }
  } )

}

/** @constant {Function} _ Алиас для qL */
const _ = qL;
