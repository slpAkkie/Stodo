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
