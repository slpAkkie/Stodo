/**
 * --------------------------------------------------
 * Defaults
 */

const data = {
  active_tab: 0,
};



/**
 * --------------------------------------------------
 * Tabs data
 */

const tabs = {

  /** ------------------------- */
  active: [
    {
      title: 'First todo',
      until: {
        date: '10.04.2021',
        time: '11:00',
      },
      sub: [],
    },
    {
      title: 'Second todo',
      until: {
        date: '12.04.2021',
        time: '15:00',
      },
      sub: [
        { title: 'First sub for second todo', completed: false }
      ],
    },
  ],

  /** ------------------------- */
  completed: [],

};



/**
 * --------------------------------------------------
 * Task functions
 */

const task = {

  container: null,

  add() { },

  setCompleted() { },

  delete() { },

  filter( criteria = [] ) { },

  edit() { },

  render() { },

  renderSub() { },

  move() { },

};



/**
 * --------------------------------------------------
 * General functions
 */

function render() { }

function extractFilters() { }

function tabSwitch() {
    let id = data.active_tab = +!data.active_tab;
    toggleClass(selectEl(`.tab[data-id="${id}"]`), 'active');
    toggleClass(selectEl(`.tab[data-id="${+!id}"]`), 'active');
}



/**
 * --------------------------------------------------
 * Popup functions
 */

const popup = {

  show() { },

  hide() { },

  reset() { },

  fill( data = {} ) { },

};



/**
 * --------------------------------------------------
 * LocalStorage functions
 */

const LS = {

  set( k, v ) { },

  get( k, d = null ) { },

};



/**
 * --------------------------------------------------
 * Additions
 */

function selectEl(selector) {
  let els = document.querySelectorAll(selector);
  switch (els.length) {
    case 0: return null;
    case 1: return els[0];
    default: return Array.from(els);
  }
}

function each(els, callback) {
  if (!Array.isArray(els)) els = [els];

  els.forEach( (el, i) => { callback.call(el, el) } )
}

function hasClass(el, className) {
  return el.classList.contains(className);
}

function addClass(el, className) {
  return el.classList.add(className);
}

function removeClass(el, className) {
  return el.classList.remove(className);
}

function toggleClass(el, className) {
  if (hasClass(el, className))
    return removeClass(el, className);
  return addClass(el, className);
}



/**
 * --------------------------------------------------
 * EventListeners
 */

/** ---------------
 * Switch tab */
each(
    selectEl('.tab'),
    el => el.addEventListener('click', tabSwitch)
);