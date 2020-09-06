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

export class CalendarReply extends Event {
  static eventType = 'calendar-reply';

  /*
     The following are the fields provided by this event

     date: Resultant Date/Time after editing in seconds since 1970

  */

  constructor(date) {
    super('calendar-reply',{composed: true, bubbles: true});
    this.date = date;
  }
};

export class CalendarRequest extends Event {
  static eventType = 'calendar-request';

  /*
     The following are the fields provided by this event

     date: Starting Date Time in Seconds since 1970

  */

  constructor(date) {
    super('calendar-request',{composed: true, bubbles: true});
    this.date = date;
  }
};

export class CommentChanged extends Event {
  static eventType = 'comment-changed';

  /*
     The following are the fields provided by this event

     changed: new value of comment

  */

  constructor(changed) {
    super('comment-changed',{composed: true, bubbles: true});
    this.changed = changed;
  }
};
export class CommentReply extends Event {
  static eventType = 'comment-reply';

  /*
     The following are the fields provided by this event

     comment: edited string;

  */

  constructor(comment) {
    super('comment-reply', { composed: true, bubbles: true });
    this.comment = comment;
  }
};

export class CommentRequest extends Event {
  static eventType = 'comment-request';

  /*
     The following are the fields provided by this event

     comment: String to be edited 

  */

  constructor(comment) {
    super('comment-request',{composed: true, bubbles: true});
    this.comment = comment;
  }
};

export class CommentShow extends Event {
  static eventType = 'comment-show';

  /*
     The following are the fields provided by this event

     comment: 

  */

  constructor(comment) {
    super('comment-show',{composed: true, bubbles: true});
    this.comment = comment;
  }
};

export class CompetitionChanged extends Event {
  static eventType = 'competition-changed';

  /*
     The following are the fields provided by this event

     changed: an object with at least a cid field.  Fields are:
      cid - id of appropriate competion
      adm - uid of administration (0 if unassign)
      name - new name if name changed.
  */

  constructor(changed) {
    super('competition-changed',{composed: true, bubbles: true});
    this.changed = changed;
  }
};


export class CompetitionCreate extends Event {
  static eventType = 'competition-create';

  /*
     The following are the fields provided by this event

     competition: object with name, and administrator fields.

  */

  constructor(competition) {
    super('competition-create',{composed: true, bubbles: true});
    this.competition = competition;
  }
};


export class CompetitionDelete extends Event {
  static eventType = 'competition-delete';

  /*
     The following are the fields provided by this event

     cid: cid of competition to be deleted (note this is after confirmation)

  */

  constructor(cid) {
    super('competition-delete',{composed: true, bubbles: true});
    this.cid = cid;
  }
};


export class CompetitionsReread extends Event {
  static eventType = 'competitions-reread';

  /*
     The following are the fields provided by this event

     none: no fields, this is just an r

  */

  constructor() {
    super('competitions-reread',{composed: true, bubbles: true});
  }
};

export class DeleteReply extends Event {
  static eventType = 'delete-reply';

  /*
     The following are the fields provided by this event

     none: A reply is a confirmation, no reply is a reject  

  */

  constructor() {
    super('delete-reply',{composed: true, bubbles: true});
  }
};


export class DeleteRequest extends Event {
  static eventType = 'delete-request';

  /*
     The following are the fields provided by this event

     item: The name of the item being requested to delete.

  */

  constructor(item) {
    super('delete-request',{composed: true, bubbles: true});
    this.item = item;
  }
};

export class EmojiClosed extends Event {
  static eventType = 'emoji-closed';

  /*
     The following are the fields provided by this event

     none: Just indicates emojo panel dialog closed 

  */

  constructor() {
    super('emoji-closed',{composed: true, bubbles: true});
  }
};

export class EmojiRequest extends Event {
  static eventType = 'emoji-request';

  /*
     The following are the fields provided by this event

     none: 

  */

  constructor() {
    super('emoji-request',{composed: true, bubbles: true});
  }
};
export class EmojiSelect extends Event {
  static eventType = 'emoji-select';

  /*
     The following are the fields provided by this event

     emoji: a single character from the range of emojis available

  */

  constructor(emoji) {
    super('emoji-select',{composed: true, bubbles: true});
    this.emoji = emoji;
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


export class InputReply extends Event {
  static eventType = 'input-reply';

  /*
     The following are the fields provided by this event

     reply: field and value

  */

  constructor(reply) {
    super('input-reply',{composed: true, bubbles: true});
    this.reply = reply;
  }
};

export class InputRequest extends Event {
  static eventType = 'input-request';

  /*
     The following are the fields provided by this event

     request: field and value

  */

  constructor(request) {
    super('input-request',{composed: true, bubbles: true});
    this.request = request;
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

export class MatchChanged extends Event {
  static eventType = 'match-changed';

  /*
     The following are the fields provided by this event

     match: rid and aid from match plus field(s) that have changed

  */

  constructor(match) {
    super('match-changed',{composed: true, bubbles: true});
    this.match = match;
  }
};

export class MatchCreate extends Event {
  static eventType = 'match-create';

  /*
     The following are the fields provided by this event

     match: rid and aid for new match

  */

  constructor(match) {
    super('match-create',{composed: true, bubbles: true});
    this.match = match;
  }
};

export class MatchDelete extends Event {
  static eventType = 'match-delete';

  /*
     The following are the fields provided by this event

     match: rid and aid of match to delete

  */

  constructor(match) {
    super('match-delete',{composed: true, bubbles: true});
    this.match = match;
  }
};
export class MatchPick extends Event {
  static eventType = 'match-pick';

  /*
     The following are the fields provided by this event

     pick: {aid: xxx, pid: xxx, over: true/false} (cid, rid and uid already known, pid and over only present if relevant)

  */

  constructor(pick) {
    super('match-pick',{composed: true, bubbles: true});
    this.pick = pick;
  }
};

export class MatchSwap extends Event {
  static eventType = 'match-swap';

  /*
     The following are the fields provided by this event

     match: rid and aid of match + drop if we are dropping hid from new record NOTE;
            With drop, from a users perspective, we have just deselected the aid.  The old hid (assuming there was one)
            becomes the new aid and the new hid is set to null. This event is not used if the result is deleting the match (no hid when aid deselected)

  */

  constructor(match) {
    super('match-swap',{composed: true, bubbles: true});
    this.match = match;
  }
};
export class MenuAdd extends Event {
  static eventType = 'menu-add';

  /*
     The following are the fields provided by this event

     none: we are only using this for close
  */

  constructor() {
    super('menu-add', { composed: true, bubbles: true });
  }
};


export class MenuRemove extends Event {
  static eventType = 'menu-remove';

  /*
     The following are the fields provided by this event

     menu: item being removed 

  */

  constructor(menu) {
    super('menu-remove',{composed: true, bubbles: true});
    this.menu = menu;
  }
};
export class MenuReset extends Event {
  static eventType = 'menu-reset';

  /*
     The following are the fields provided by this event

     none: 

  */

  constructor(m) {
    super('menu-reset',{composed: true, bubbles: true});
    this.menu = m || false;
  }
};

export class OptionComment extends Event {
  static eventType = 'option-comment';

  /*
     The following are the fields provided by this event

     comment: comment (fm-rounds will do the update and knows what the cid, rid and uid are)

  */

  constructor(comment) {
    super('option-comment',{composed: true, bubbles: true});
    this.comment = comment;
  }
};


export class OptionCreate extends Event {
  static eventType = 'option-create';

  /*
     The following are the fields provided by this event

     option: rid, label

  */

  constructor(option) {
    super('option-create',{composed: true, bubbles: true});
    this.option = option;
  }
};

export class OptionDelete extends Event {
  static eventType = 'option-delete';

  /*
     The following are the fields provided by this event

     option: rid, opid

  */

  constructor(option) {
    super('option-delete',{composed: true, bubbles: true});
    this.option = option;
  }
};

export class OptionPick extends Event {
  static eventType = 'option-pick';

  /*
     The following are the fields provided by this event

     pick: opid of option picked. (fm-rounds will do the update and knows what the cid, rid and uid are)

  */

  constructor(pick) {
    super('option-pick',{composed: true, bubbles: true});
    this.pick = pick;
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


export class PlayoffPick extends Event {
  static eventType = 'playoff-pick';

  /*
     The following are the fields provided by this event

     pick: tid of team being picked.  This is unvalidated

  */

  constructor(pick) {
    super('playoff-pick',{composed: true, bubbles: true});
    this.pick = pick;
  }
};


export class PromoteList extends Event {
  static eventType = 'promote-list';

  /*
     The following are the fields provided by this event

     list: List of users who may be (or may not be) being promoted

  */

  constructor(list) {
    super('promote-list',{composed: true, bubbles: true});
    this.list = list;
  }
};

export class RoundChanged extends Event {
  static eventType = 'round-changed';

  /*
     The following are the fields provided by this event

     changed: object of  fields change.  Must include rid.

  */

  constructor(changed) {
    super('round-changed',{composed: true, bubbles: true});
    this.changed = changed;
  }
};

export class RoundCreate extends Event {
  static eventType = 'round-create';

  /*
     The following are the fields provided by this event

     round: Name of Round.

  */

  constructor(round) {
    super('round-create',{composed: true, bubbles: true});
    this.round = round;
  }
};

export class RoundDelete extends Event {
  static eventType = 'round-delete';

  /*
     The following are the fields provided by this event

     round: rid of round to delete.

  */

  constructor(round) {
    super('round-delete',{composed: true, bubbles: true});
    this.round = round;
  }
};

export class RoundSelected extends Event {
  static eventType = 'round-selected';

  /*
     The following are the fields provided by this event

     rid: Round Number

  */

  constructor(rid) {
    super('round-selected',{composed: true, bubbles: true});
    this.rid = rid;
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
    if (status === 'authorised') console.log('session event', this);
    this.status = status;
  }
};

export class TeamAssign extends Event {
  static eventType = 'team-assign';

  /*
     The following are the fields provided by this event

     assign: An object consiting of tid (String) and assign Boolean fields

  */

  constructor(assign) {
    super('team-assign',{composed: true, bubbles: true});
    this.assign = assign;
  }
};

export class TeamDeselected extends Event {
  static eventType = 'team-deselected';

  /*
     The following are the fields provided by this event

     tid:   tid of team selected

  */

  constructor(tid) {
    super('team-deselected', { composed: true, bubbles: true });
    this.tid = tid;
  }
};

export class TeamEliminated extends Event {
  static eventType = 'team-eliminated';

  /*
     The following are the fields provided by this event

     team: tid and eliminated

  */

  constructor(team) {
    super('team-eliminated',{composed: true, bubbles: true});
    this.team = team;
  }
};
export class TeamLock extends Event {
  static eventType = 'team-lock';

  /*
     The following are the fields provided by this event

     lock: True or false dependant on new state.

  */

  constructor(lock) {
    super('team-lock',{composed: true, bubbles: true});
    this.lock = lock;
  }
};

export class TeamPoint extends Event {
  static eventType = 'team-point';

  /*
     The following are the fields provided by this event

     point: An object consisting of tid (String) and points (Number);

  */

  constructor(point) {
    super('team-point',{composed: true, bubbles: true});
    this.point = point;
  }
};

export class TeamsReset extends Event {
  static eventType = 'teams-reset';

  /*
     The following are the fields provided by this event

     none: 

  */

  constructor() {
    super('teams-reset',{composed: true, bubbles: true});
  }
};

export class TeamSelected extends Event {
  static eventType = 'team-selected';

  /*
     The following are the fields provided by this event

     tid:   tid of team selected

  */

  constructor(tid) {
    super('team-selected',{composed: true, bubbles: true});
    this.tid = tid;
  }
};
export class TeamsSet extends Event {
  static eventType = 'teams-set';

  /*
     The following are the fields provided by this event

     none:

  */

  constructor() {
    super('teams-set',{composed: true, bubbles: true});
  }
};

export class UserSelected extends Event {
  static eventType = 'user-selected';

  /*
     The following are the fields provided by this event

     uid: id of selected user

  */

  constructor(uid) {
    super('user-selected',{composed: true, bubbles: true});
    this.uid = uid;
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

export class WaitRequest extends Event {
  static eventType = 'wait-request';

  /*
     The following are the fields provided by this event

     wait: true or false, depending with wait on or off.

  */

  constructor(wait) {
    super('wait-request',{composed: true, bubbles: true});
    this.wait = wait;
  }
};

