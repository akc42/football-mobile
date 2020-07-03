/**
    @licence
    Copyright (c) 2020 Alan Chandler, all rights reserved

    This file is part of PASv5, an implementation of the Patient Administration
    System used to support Accuvision's Laser Eye Clinics.

    PASv5 is licenced to Accuvision (and its successors in interest) free of royality payments
    and in perpetuity in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
    implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. Accuvision
    may modify, or employ an outside party to modify, any of the software provided that
    this modified software is only used as part of Accuvision's internal business processes.

    The software may be run on either Accuvision's own computers or on external computing
    facilities provided by a third party, provided that the software remains soley for use
    by Accuvision (or by potential or existing customers in interacting with Accuvision).
*/
/*
  The purpose of this file is to hold all the definitions of custom events used in pas.  We define
  event here as a sublassing of window event and then don't need to use customEvent.

 
  export class MyEvent extends Event {
    static eventType = 'my-event';

    // a place to document event fields
    myData;

    constructor(myData) {
      super(MyEvent.eventType);
      this.myData = myData;
    }
  }
  -----------
  this.dispatchEvent(new MyEvent(42));

  el.addEventListener(MyEvent.eventType, e => console.log(e.myData));

*/

export class ApiError extends Event {
  static eventType = 'api-error';

  /*
     The following are the fields provided by this event

     reason: reason for error

  */

  constructor(reason) {
    super('api-error',{composed: true, bubbles: true});
    this.reason = reason;
  }
};

export class AuthChanged extends Event {
  static eventType = 'auth-changed';

  /*
     The following are the fields provided by this event

     changed: 

  */

  constructor(changed) {
    super('auth-changed',{composed: true, bubbles: true});
    this.changed = changed;
  }
};


export class CompetitionsChanged extends Event {
  static eventType = 'competitions-changed';

  /*
     The following are the fields provided by this event

     none: some aspect of the competitions list has changed, suggesting it is re-read 

  */

  constructor() {
    super('competitions-changed',{composed: true, bubbles: true});
  }
};

export class FormError extends Event {
  static eventType = 'form-error';

  /*
     The following are the fields provided by this event

     none

  */

  constructor() {
    super('form-error',{composed: true, bubbles: true});
  }
};


export class FormResponse extends Event {
  static eventType = 'form-response';

  /*
     The following are the fields provided by this event

     response: The response from the api call.

  */

  constructor(response) {
    super('form-response',{composed: true, bubbles: true});
    this.response = response;
  }
};

export class KeyPressed extends Event {
  static eventType = 'key-pressed';

  /*
     The following are the fields provided by this event

     keys: The code string of the key pressed. (but event.key when one is pressed)

  */

  constructor(keys) {
    super('key-pressed',{composed: true, bubbles: true});
    this.key = keys;
  }
};

export class KeyUpdated extends Event {
  static eventType = 'key-updated';

  /*
    The purpose of this event is to cross inform subsytems that something they may be interested in has been updated.
    The <app-pages> element will eventually receive these, and depending where it comes from will send update and agreed parameter on the 
    subsystems that might be interest.

    key value that they are both interested in has updated. This allows a subsystem, that may not actualy be active to update its data

    The following are the fields provided by this event

     entity:  The type of entity (as a string) that this refers to. We will keep the list of allowed entities names here:-


  */

  constructor(entity, key) {
    super('key-updated', { composed: true, bubbles: true });
    this.entity = entity;
    this.key = key;
  }
};

export class LocationAltered extends Event {
  static eventType = 'location-altered';

  /*
     The following are the fields provided by this event

     none: 

  */

  constructor() {
    super('location-altered',{composed: true, bubbles: true});
  }
};

export class LogoffRequest extends Event {
  static eventType = 'logoff-request';

  /*
     The following are the fields provided by this event

     none:   

  */

  constructor() {
    super('logoff-request',{composed: true, bubbles: true});
  }
};
export class MenuAdd extends Event {
  static eventType = 'menu-add';

  /*
     The following are the fields provided by this event

     menu: name of a menu item to be dynamically added

  */

  constructor(menu) {
    super('menu-add', { composed: true, bubbles: true });
    this.menu = menu;
  }
};


export class MenuReset extends Event {
  static eventType = 'menu-reset';

  /*
     The following are the fields provided by this event

     none: 

  */

  constructor() {
    super('menu-reset',{composed: true, bubbles: true});
  }
};
export class OverlayClosed  extends Event {
  static eventType = 'overlay-closed';

  /*
     The following are the fields provided by this event

     reason: reason overlay closed
     position: x,y coordinates of mouse click outside box that caused it to close 

  */

  constructor(reason,position) {
    super('overlay-closed',{composed: true, bubbles: true});
    this.reason = reason;
    this.position = position;
  }
};

export class OverlayClosing extends Event {
  static eventType = 'overlay-closing';

  /*
     The following are the fields provided by this event

     none

  */

  constructor() {
    super('overlay-closing',{composed: true, bubbles: true});
  }
};

export class OverwriteWarning extends Event {
  static eventType = 'overwrite-warning';

  /*
     The following are the fields provided by this event

     None

  */

  constructor() {
    super('overwrite-warning',{composed: true, bubbles: true});
  }
};

export class PageClose extends Event {
  static eventType = 'page-close';

  /*
     The following are the fields provided by this event

    none: 

  */

  constructor() {
    super('page-close', { composed: true, bubbles: true });
  }
};

export class PageClosed extends Event {
  static eventType = 'page-closed';

  /*
     The following are the fields provided by this event

    none: 

  */

  constructor() {
    super('page-closed', { composed: true, bubbles: true });
  }
};


export class PageData extends Event {
  static eventType = 'page-data';

  /*
     The following are the fields provided by this event

     pageData: 

  */

  constructor(pageData) {
    super('page-data',{composed: true, bubbles: true});
    this.pageData = pageData;
  }
};

export class PageTitle extends Event {
  static eventType = 'page-title';

  /*
     The following are the fields provided by this event

     pageTitle: Title to be displayed at head of page

  */

  constructor(pageTitle) {
    super('page-title', { composed: true, bubbles: true });
    this.pageTitle = pageTitle;
  }
};


export class RouteChanged extends Event {
  static eventType = 'route-changed';

  /*
     The following are the fields provided by this event

     changed: path and segment (route) that has changed 

  */

  constructor(route) {
    super('route-changed',{composed: true, bubbles: true});
    this.changed = route;
  }
};

export class SessionStatus extends Event {
  static eventType = 'session-status';

  /*
     The following are the fields provided by this event

     status: We have an update releted to our progress through the session process

  */

  constructor(status) {
    super('session-status',{composed: true, bubbles: true});
    this.status = status;
  }
};

export class ValueChanged extends Event {
  static eventType = 'value-changed';

  /*
     The following are the fields provided by this event

     changed: the new value

  */

  constructor(value) {
    super('value-changed',{composed: true, bubbles: true});
    this.changed = value;
  }
};

