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
  

  /*
     The following are the fields provided by this event

     none: no fields, this is just an r

  */

  constructor() {
    super('competitions-reread',{composed: true, bubbles: true});
  }
};

export class DeleteReply extends Event {
  

  /*
     The following are the fields provided by this event

     none: A reply is a confirmation, no reply is a reject  

  */

  constructor() {
    super('delete-reply',{composed: true, bubbles: true});
  }
};


export class DeleteRequest extends Event {
  

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
  

  /*
     The following are the fields provided by this event

     none: Just indicates emojo panel dialog closed 

  */

  constructor() {
    super('emoji-closed',{composed: true, bubbles: true});
  }
};

export class EmojiRequest extends Event {
  

  /*
     The following are the fields provided by this event

     none: 

  */

  constructor() {
    super('emoji-request',{composed: true, bubbles: true});
  }
};
export class EmojiSelect extends Event {
  

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
  

  /*
     The following are the fields provided by this event

     none

  */

  constructor() {
    super('form-error',{composed: true, bubbles: true});
  }
};


export class FormResponse extends Event {
  

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
  

  /*
     The following are the fields provided by this event

     none: 

  */

  constructor() {
    super('location-altered',{composed: true, bubbles: true});
  }
};

export class MatchChanged extends Event {
  

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
  

  /*
     The following are the fields provided by this event

     pick: {cid: xxx, rid: xxx,uid: xxx, aid: xxx, pid: xxx, over: true/false} (pid and over only present if relevant)

  */

  constructor(pick) {
    super('match-pick',{composed: true, bubbles: true});
    this.pick = pick;
  }
};

export class MatchSwap extends Event {
  

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
  

  /*
     The following are the fields provided by this event

     none: we are only using this for close
  */

  constructor() {
    super('menu-add', { composed: true, bubbles: true });
  }
};


export class MenuRemove extends Event {
  

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
  

  /*
     The following are the fields provided by this event

     none

  */

  constructor() {
    super('overlay-closing',{composed: true, bubbles: true});
  }
};

export class OverwriteWarning extends Event {
  

  /*
     The following are the fields provided by this event

     None

  */

  constructor() {
    super('overwrite-warning',{composed: true, bubbles: true});
  }
};

export class PageClose extends Event {
  

  /*
     The following are the fields provided by this event

    none: 

  */

  constructor() {
    super('page-close', { composed: true, bubbles: true });
  }
};

export class PageClosed extends Event {
  

  /*
     The following are the fields provided by this event

    none: 

  */

  constructor() {
    super('page-closed', { composed: true, bubbles: true });
  }
};


export class PageData extends Event {
  

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
  

  /*
     The following are the fields provided by this event

     pick: tid of team being picked.  and pick (setting or unsetting as true or false)

  */

  constructor(pick) {
    super('playoff-pick',{composed: true, bubbles: true});
    this.pick = pick;
  }
};

export class PlayoffFail extends Event {
  /*
     The following are the fields provided by this event

     pick: tid of team and pick (setting or unsetting as true or false)

  */
  constructor(pick) {
    super('playoff-fail',{composed: true, bubbles: true});
    this.pick = pick;
  }
};

export class PromoteList extends Event {
  

  /*
     The following are the fields provided by this event

     list: List of users who may be (or may not be) being promoted

  */

  constructor(list) {
    super('promote-list',{composed: true, bubbles: true});
    this.list = list;
  }
};

export class RidChange extends Event {
  /*
     The following are the fields provided by this event

     rid: rid that we are changing to (in current competition)

  */
  constructor(rid) {
    super('rid-change',{composed: true, bubbles: true});
    this.rid = rid;
  }
};
export class RoundChanged extends Event {
  

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
  

  /*
     The following are the fields provided by this event

     none: 

  */

  constructor() {
    super('teams-reset',{composed: true, bubbles: true});
  }
};

export class TeamSelected extends Event {
  

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
  

  /*
     The following are the fields provided by this event

     none:

  */

  constructor() {
    super('teams-set',{composed: true, bubbles: true});
  }
};

export class UserSelected extends Event {
  

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
  

  /*
     The following are the fields provided by this event

     wait: true or false, depending with wait on or off.

  */

  constructor(wait) {
    super('wait-request',{composed: true, bubbles: true});
    this.wait = wait;
  }
};

