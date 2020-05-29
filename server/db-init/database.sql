
-- 	Copyright (c) 2008-2012 Alan Chandler
--  This file is part of MBBall, an American Football Results Picking
--  Competition Management software suite.
--   MBBall is free software: you can redistribute it and/or modify
--  it under the terms of the GNU General Public License as published by
--  the Free Software Foundation, either version 3 of the License, or
--  (at your option) any later version.
--
--  MBBall is distributed in the hope that it will be useful,
--  but WITHOUT ANY WARRANTY; without even the implied warranty of
--  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
--  GNU General Public License for more details.
--
--  You should have received a copy of the GNU General Public License
--  along with MBBall (file COPYING.txt).  If not, see <http://www.gnu.org/licenses/>.

--
-- Database version 12 (See copy of data to default_competition below) using sqlite
--

BEGIN EXCLUSIVE;

CREATE TABLE competition (
    cid integer PRIMARY KEY ASC, --Competition ID - 
    name character varying,--This is the name that appears in the header for the competition
    condition text,	--This is the text that a user has to agree to in order to register himself for the competition
    administrator integer DEFAULT 0 NOT NULL, --The uid of the administrator
    open boolean DEFAULT 0 NOT NULL, --Says whether a user may register for the competion or not
    pp_deadline bigint DEFAULT 0 NOT NULL, --Playoff Selection Deadline 0 if no selection
    gap integer DEFAULT 300 NOT NULL, --Seconds to go before match to make pick deadline
    update_date bigint DEFAULT (strftime('%s','now')) NOT NULL, --Date Competition Created or data other than results_cache updated
    results_cache text DEFAULT NULL, -- JSON String cache of latest state of competition.
    cache_store_date bigint DEFAULT (strftime('%s','now'))
);


CREATE TABLE conference (
    confid character(3) PRIMARY KEY, --Conference 3 letter acronym
    name character varying(30)
);

-- User Pick of each division winner
CREATE TABLE div_winner_pick (
    cid integer NOT NULL, -- Competition ID
    uid integer NOT NULL, --User ID
    confid character(3) NOT NULL REFERENCES conference(confid) ON UPDATE CASCADE ON DELETE CASCADE, --Conference ID
    divid character(1) NOT NULL REFERENCES division(divid) ON UPDATE CASCADE ON DELETE CASCADE, --Division ID
    tid varchar(3) NOT NULL, --Team who will win division
    submit_time bigint DEFAULT (strftime('%s','now')) NOT NULL, --Time of submission
    admin_made boolean DEFAULT 0 NOT NULL, --set if admin made pick on behalf of user
    PRIMARY KEY (cid,uid,confid,divid),
    FOREIGN KEY (cid,uid) REFERENCES registration(cid,uid) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (cid,tid) REFERENCES team_in_competition(cid,tid)    
);

--Football Conference Division
CREATE TABLE division (
    divid character(1) PRIMARY KEY,
    name character varying(6)
);


CREATE TABLE match (
    cid integer NOT NULL, -- Competition ID
    rid integer NOT NULL, --Round ID
    aid varchar(3) NOT NULL, -- Away Team ID
    hid varchar(3) , --Home Team ID
    comment text, --Administrators Comment for the Match
    ascore integer, --Away Team Score
    hscore integer, --Home Team Score
    combined_score integer, --Value of Combined Score for an over/under question (add 0.5 to this for the question)
    open boolean DEFAULT 0 NOT NULL, --True if Match is set up and ready
    match_time bigint , --Time match is due to be played
    underdog integer DEFAULT 0 NOT NULL,  -- If 0 then not an underdog game, else if -ve additional points for away team, +ve additional points for home team
    PRIMARY KEY (cid,rid,aid),
    FOREIGN KEY (cid,rid) REFERENCES round(cid,rid) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (cid,aid) REFERENCES team_in_competition(cid,tid),
    FOREIGN KEY (cid,hid) REFERENCES team_in_competition(cid,tid)    
);

-- Holds one possible answer to the round question
CREATE TABLE option (
    cid integer NOT NULL, -- Competition ID
    rid integer NOT NULL, --Round ID
    opid integer NOT NULL, --Option ID
    label character varying, --Simple Label for this Option
    PRIMARY KEY(cid,rid,opid),
    FOREIGN KEY (cid,rid) REFERENCES round(cid,rid) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE option_pick (
    cid integer NOT NULL, -- Competition ID
    uid integer NOT NULL, --User ID
    rid integer NOT NULL, --Round ID
    opid integer NOT NULL , --ID of Question Option Selected as Correct if multichoice, else value of answer (only if multichoice)
    comment text, --General Comment from user about the round
    submit_time bigint DEFAULT (strftime('%s','now')) NOT NULL, --Time of Submission
    admin_made boolean DEFAULT 0 NOT NULL, --set if admin made pick on behalf of user
    PRIMARY KEY (cid,uid,rid)
    FOREIGN KEY (cid,rid) REFERENCES round(cid,rid) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (cid,uid) REFERENCES registration(cid,uid) ON UPDATE CASCADE ON DELETE CASCADE
);

--forum user who will participate in one or more competitions
CREATE TABLE participant (
    uid integer PRIMARY KEY,
    name character varying,
    email character varying,
    password character varying, --stores md5 of password to enable login if doing local authentication
    last_logon bigint DEFAULT (strftime('%s','now')) NOT NULL, --last time user connected
    member_approve boolean DEFAULT 0 NOT NULL,--Set true if user may approve membership
    global_admin boolean DEFAULT 0 NOT NULL, -- Set true if user is global admin (automatically allows approve membership)
    verification_key character varying, --stores either a key to override password, OR e-mail address awaiting verification
    verification_sent bigint DEFAULT (strftime('%s','now')) NOT NULL, --time the user was sent a verification e-mail;
    waiting_email boolean DEFAULT false NOT NULL, --awaiting a new email to be verified before replacing existing e-mail,
    waiting_approval boolean DEFAULT false NOT NULL --awaiting membership approval
);

CREATE TABLE pick (
    cid integer NOT NULL, -- Competition ID
    uid integer NOT NULL, --User ID.scha
    rid integer NOT NULL, --Round ID
    aid varchar(3) NOT NULL, -- Away Team ID
    comment text, --Comment on the pick and why it was chosen
    pid varchar(3), --ID of Team Picked to Win (NULL for Draw)
    over_selected boolean, --true (=1) if over score is selected
    submit_time bigint DEFAULT (strftime('%s','now')) NOT NULL, --Time of submission
    admin_made boolean DEFAULT 0 NOT NULL, --set if admin made pick on behalf of user
    PRIMARY KEY (cid,uid,rid,aid),
    FOREIGN KEY (cid,rid,aid) REFERENCES match(cid,rid,aid) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (cid,uid) REFERENCES registration(cid,uid) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (cid,pid) REFERENCES team_in_competition(cid,tid) ON UPDATE CASCADE ON DELETE CASCADE
);

--Participant registered for particular competition
CREATE TABLE registration (
    cid integer NOT NULL REFERENCES competition(cid) ON UPDATE CASCADE ON DELETE CASCADE, -- Competition ID
    uid integer NOT NULL REFERENCES participant(uid) ON UPDATE CASCADE ON DELETE CASCADE, --User ID
    agree_time bigint DEFAULT (strftime('%s','now')) , --Time Agreed to Competition Conditions (null if not yet agreed)
    approved boolean DEFAULT 0 NOT NULL, --Set if has been approved to play (non guests will be automatically approved)
    PRIMARY KEY (cid,uid)
);

-- Round in Competition
CREATE TABLE round (
    cid integer NOT NULL REFERENCES competition(cid) ON UPDATE CASCADE ON DELETE CASCADE, -- Competition ID
    rid integer NOT NULL, --Round Number
    question text, --Bonus Question Text
    comment text, -- Administrator comment on the bonus question
    valid_question boolean DEFAULT 0, --Set once a valid bonus question has been set up
    answer integer, --If not null an answer to a numeric question or opid of mutichoice question
    value smallint DEFAULT 1 NOT NULL, --Value given for a correct pick
    bvalue smallint DEFAULT 2 NOT NULL, --Value given for a correct answer to the bonus question
    name character varying, --Name of the Round
    ou_round boolean DEFAULT 0 NOT NULL, --set if over underscores are requested for this round
    deadline bigint, --Time Deadline for submitting answers to bonus questions
    open boolean DEFAULT 0 NOT NULL,  --says whether round is availble for display
    update_date bigint DEFAULT (strftime('%s','now')) NOT NULL, --date of last update other than the update of the results cache
    results_cache text DEFAULT NULL, -- JSON String cache of recent result table
    cache_store_date bigint DEFAULT (strftime('%s','now')),
    PRIMARY KEY (cid,rid)
);

-- Settings used to define various aspects of operation
CREATE TABLE settings (
    name character varying(20) PRIMARY KEY, -- Setting Name
    value integer -- although an Int, We can store strings in here
);
--Styles used throughout the application
CREATE TABLE styles (
    name character varying PRIMARY KEY, --style variable name without the leading double dashes
    style character varying DEFAULT NULL --the value of the style.  Note it could refer to another style using 'var(--my-other-style)'
);
--Emoticons used in the application
CREATE TABLE emoticons (
    code char varying PRIMARY KEY, --code used in text preceed by ":" that user can use to include the emoticon
    filename char varying --The filename to be displayed as an image for that emoticon 
);

CREATE TABLE team (
    tid varchar(3) PRIMARY KEY,
    name character varying(50) NOT NULL,
    logo character varying(80) DEFAULT NULL,
    url character varying(100) DEFAULT NULL, 
    confid character(3) NOT NULL REFERENCES conference(confid) ON UPDATE CASCADE ON DELETE CASCADE, --Conference ID Team Plays In
    divid character(1) NOT NULL REFERENCES division(divid) ON UPDATE CASCADE ON DELETE CASCADE --Division ID Team Plays In
);

CREATE TABLE team_in_competition (
    cid integer NOT NULL REFERENCES competition(cid) ON UPDATE CASCADE ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED, -- Competition ID
    tid varchar(3) NOT NULL REFERENCES team(tid) ON UPDATE CASCADE ON DELETE CASCADE, --TeamID
    made_playoff boolean DEFAULT 0 NOT NULL, --True if team made playoffs
    points integer DEFAULT 1 NOT NULL, -- points to allocate if successfully chose team to make playoff
    PRIMARY KEY (cid,tid)
);

--Users Pick of WildCard Entries for each conference
CREATE TABLE wildcard_pick (
    cid integer NOT NULL, -- Competition ID
    uid integer NOT NULL, --User ID
    confid character(3) NOT NULL REFERENCES conference(confid) ON UPDATE CASCADE ON DELETE CASCADE, --Conference ID
    opid smallint DEFAULT 1 NOT NULL, -- Either 1 or 2 depending on which wildcard pick for the conference it is
    tid varchar(3) NOT NULL, --Pick
    submit_time bigint DEFAULT (strftime('%s','now')) NOT NULL, --Time of Submission
    admin_made boolean DEFAULT 0 NOT NULL, --set if admin made pick on behalf of user
    PRIMARY KEY(cid,uid,confid,opid)
    FOREIGN KEY (cid,uid) REFERENCES registration(cid,uid) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (cid,tid) REFERENCES team_in_competition(cid,tid)
);

-- END OF TABLES -------------------------------------------------------------------------------------------------

-- START VIEWS ----------------------------------------------------

--points user scored in a match from the pick and over/under question (if present)
CREATE VIEW match_score AS
 SELECT m.cid, m.rid, m.aid, u.uid, 
        CASE
            WHEN p.uid IS NULL THEN 0
            ELSE r.value + 
	      CASE
		WHEN p.pid = m.hid AND m.underdog > 0 THEN m.underdog
		WHEN p.pid = m.aid AND m.underdog < 0 THEN -m.underdog
		ELSE 0
	      END
        END AS pscore, 
        CASE
            WHEN o.uid IS NULL THEN 0
            ELSE 1
        END * r.value AS oscore
   FROM registration u
   JOIN match m USING(cid)
   JOIN round r USING (cid,rid)
   LEFT JOIN pick p ON  p.cid = m.cid AND p.rid = m.rid AND p.aid = m.aid AND p.uid = u.uid
	AND ((m.hscore >= m.ascore AND p.pid = m.hid) OR (m.hscore <= m.ascore AND p.pid = m.aid))
   LEFT JOIN pick o ON  o.cid = m.cid AND o.rid = m.rid AND o.aid = m.aid AND o.uid = u.uid AND r.ou_round = 1
 	AND (CAST((m.hscore + m.ascore) AS REAL) > (CAST( m.combined_score AS REAL) + 0.5)) == o.over_selected 
  WHERE r.open = 1 AND m.open = 1;

-- Points scored in round by user answering the bonus question
CREATE VIEW bonus_score AS
    SELECT r.cid,r.rid, u.uid, (CASE WHEN p.uid IS NULL THEN 0 ELSE 1 END * r.bvalue) AS score
	FROM ((registration u JOIN round r USING(cid) )
	LEFT JOIN option_pick p ON ((((p.cid = r.cid) AND (p.rid = r.rid) AND (p.uid = u.uid) AND (p.opid = r.answer)) AND (r.valid_question = 1))))
	WHERE r.open = 1 ;
	
--used to identify teams a user has picked correctly
CREATE VIEW playoff_picks AS
	SELECT cid,tid, uid, confid,admin_made,submit_time
		FROM wildcard_pick
	UNION ALL
	SELECT cid,tid,uid, confid,admin_made,submit_time
		FROM div_winner_pick;

-- Score user makes in correctly guessing the playoffs
CREATE VIEW playoff_score AS
	SELECT 
	    u.cid,u.uid, sum(CASE WHEN p.points IS NULL THEN 0 ELSE p.points END) AS score, c.confid
	FROM 
	  registration u,
	  conference c
	  LEFT JOIN (playoff_picks p JOIN team_in_competition t ON p.cid = t.cid AND p.tid = t.tid AND t.made_playoff = 1) AS p
	    USING (cid,uid,confid)
	  GROUP BY u.cid,u.uid, c.confid;

--  Get total score for the round by user 
CREATE VIEW round_score AS
SELECT r.cid,r.rid, r.uid, sum(
        CASE
            WHEN m.pscore IS NULL THEN 0
            ELSE m.pscore
        END) AS pscore, sum(
        CASE
            WHEN m.oscore IS NULL THEN 0
            ELSE m.oscore
        END) AS oscore, sum(
        CASE
            WHEN m.pscore IS NULL THEN 0
            ELSE m.pscore
        END + 
        CASE
            WHEN m.oscore IS NULL THEN 0
            ELSE m.oscore
        END) AS mscore, r.score AS bscore, sum(
        CASE
            WHEN m.pscore IS NULL THEN 0
            ELSE m.pscore
        END + 
        CASE
            WHEN m.oscore IS NULL THEN 0
            ELSE m.oscore
        END) + r.score AS score
   FROM bonus_score r 
   LEFT JOIN match_score m USING (cid,rid, uid)
  GROUP BY r.cid,r.rid, r.uid, r.score;

-- END OF VIEWS ------------------------------------------------------------------
-- STANDARD DATA

INSERT INTO conference(confid, name) VALUES ('AFC','American Football Conference');
INSERT INTO conference(confid, name) VALUES ('NFC','National Football Conference');

INSERT INTO division (divid, name)  VALUES ('N','North');
INSERT INTO division (divid, name)  VALUES ('E','East');
INSERT INTO division (divid, name)  VALUES ('S','South');
INSERT INTO division (divid, name)  VALUES ('W','West');

INSERT INTO team (tid, name, logo,  confid, divid) VALUES('NE','New England Patriots','NE_logo-50x50.gif','AFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('NYG','New York Giants','NYG_logo-50x50.gif','NFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('TEN','Tennessee Titans','TEN_logo-50x50.gif','AFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('IND','Indianapolis Colts','IND_logo-50x50.gif','AFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('DAL','Dallas Cowboys','DAL_logo-50x50.gif','NFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('WAS','Washington Redskins','WAS_logo-50x50.gif','NFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('SEA','Seattle Seahawks','SEA_logo-50x50.gif','NFC','W');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('ATL','Atlanta Falcons','ATL_logo-50x50.gif','NFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('CIN','Cincinnati Bengals','CIN_logo-50x50.gif','AFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('MIA','Miami Dolphins','MIA_logo-50x50.gif','AFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('CAR','Carolina Panthers','CAR_logo-50x50.gif','NFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('TB','Tampa Bay Buccaneers','TB_logo-50x50.gif','NFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('BUF','Buffalo Bills','BUF_logo-50x50.gif','AFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('PHI','Philadelphia Eagles','PHI_logo-50x50.gif','NFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('NO','New Orleans Saints','NO_logo-50x50.gif','NFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('CHI','Chicago','CHI_logo-50x50.gif','NFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('JAC','Jacksonville Jaguars','JAC_logo-50x50.gif','AFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('HOU','Houston Texans','HOU_logo-50x50.gif','AFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('SF','San Francisco 49ers','SF_logo-50x50.gif','NFC','W');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('CLE','Cleveland Browns','CLE_logo-50x50.gif','AFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('PIT','Pittsburgh Steelers','PIT_logo-50x50.gif','AFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('BAL','Baltimore Ravens','BAL_logo-50x50.gif','AFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('DET','Detroit Lions','DET_logo-50x50.gif','NFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('GB','Green Bay Packers','GB_logo-50x50.gif','NFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('SD','San Diego Chargers','SD_logo-50x50.gif','AFC','W');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('OAK','Oakland Raiders','OAK_logo-50x50.gif','AFC','W');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('MIN','Minnesota Vikings','MIN_logo-50x50.gif','NFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('DEN','Denver Broncos','DEN_logo-50x50.gif','AFC','W');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('STL','St. Louis Rams','STL_logo-50x50.gif','NFC','W');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('NYJ','New York Jets','NYJ_logo-50x50.gif','AFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('ARI','Arizona Cardinals','ARI_logo-50x50.gif','NFC','W');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('KC','Kansas City Chiefs','KC_logo-50x50.gif','AFC','W');

INSERT INTO settings (name,value) VALUES('version',14); --version of this configuration
-- values for client config
INSERT INTO settings (name,value) VALUES('default_competition',0); -- cid of default competition 0 means we don't know what it is
INSERT INTO settings (name,value) VALUES('pointsmap','[1,2,4,6,8,12,16]'); -- map of slider position to output result
INSERT INTO settings (name,value) VALUES('underdogmap','[0,1,2,4,6,8]'); --map of absolute slider positions to underdog points
INSERT INTO settings (name,value) VALUES('playoffmap','[1,2,4,6,8]'); --map of playoff points slider position to points allocated
INSERT INTO settings (name,value) VALUES('bonusmap','[1,2,4,6,8,12,16]');--map of bonus question points slider position to points allocated
INSERT INTO settings (name,value) VALUES('defaultbonus',2); --default value of question bonus when new round created
INSERT INTO settings (name,value) VALUES('client_log',''); --if none empty string should specify which function areas client should log.
INSERT INTO settings (name,value) VALUES('client_log_uid',0); --if non zero limit client logging to that uid.
INSERT INTO settings (name,value) VALUES('cookie_visit_name','MBFMVISIT'); --name used for a cookie to record a visit where the user logged on.
INSERT INTO settings (name,value) VALUES('main_menu_icon','menu'); --character from material icon font to use as the main menu.
--values for server config
INSERT INTO settings (name,value) VALUES('cache_age',84400);--cache age before invalid (in seconds), 0 is infinite
INSERT INTO settings (name,value) VALUES('server_port', 2040); --port the api server should listen on.
INSERT INTO settings (name,value) VALUES('cookie_name', 'MBBall'); --name used for our main cookie
INSERT INTO settings (name,value) VALUES('cookie_key', 'Football9Key7AID'); --key used to encrypt/decrypt cookie token
INSERT INTO settings (name,value) VALUES('cookie_expires', 720); --hours until expire for standard logged on token
INSERT INTO settings (name,value) VALUES('cookie_short_expires', 24); --hours until expire for short length cookie

-- Messages used by admin
INSERT INTO settings (name,value) VALUES('msgdeletecomp','Deleting a Competition will delete all the Rounds and Matches associated with it. Do you wish to Proceed?');
INSERT INTO settings (name,value) VALUES('msgregister','Click OK to register for the competition and agree to the condition');
INSERT INTO settings (name,value) VALUES('msgcondition','In order to enter the competition you must agree to the following condition:-');
INSERT INTO settings (name,value) VALUES('msgguestnote','Guests require special approval from the competition administrator ($$$). Please contact her/him <i>after registering</i> if you are a Guest');
INSERT INTO settings (name,value) VALUES('msgnoquestion','ERROR - your picks were made, but the bonus question was NOT answered.  It needs to be a whole number (integer)');
INSERT INTO settings (name,value) VALUES('msgdeadline','Do you mean to set the deadline before now?');
INSERT INTO settings (name,value) VALUES('msgmatchtime','Do you mean to set the matchtime before now?');
INSERT INTO settings (name,value) VALUES('msgnomatchdate','Are you sure you want to open this match without a match date set?');
INSERT INTO settings (name,value) VALUES('msgdeletematch','This match has picks refering to it. Deleting the match will also delete the picks.  Do you still wish to proceed?');
INSERT INTO settings (name,value) VALUES('msgquesdead','Do you mean to set the question deadline before now?');
INSERT INTO settings (name,value) VALUES('msgnomatchround','There are no open matches, are you sure you wish to open the round?');
INSERT INTO settings (name,value) VALUES('msgdeleteround','Deleting a Round will delete all the Matches and Picks associated with it. Do you wish to Proceed?');
INSERT INTO settings (name,value) VALUES('msgapprove','You are changing the approval status of a Baby Backup for this Competition. Are you sure you want to do this?');
INSERT INTO settings (name,value) VALUES('msgunregister','This will Un-Register this User from this Competition. Do you wish to Proceed?');
INSERT INTO settings (name,value) VALUES('msgconstraint','Cannot remove team from competition, it is used in picks or matches');
-- STYLES ----------------------------
-- THIS will possibly change in every use of this application
INSERT INTO styles (name,style) VALUES('app-primary-color', '#adcabd'); --Main colour for use in the application
INSERT INTO styles (name,style) VALUES('app-accent-color', '#131335'); --Colour to use when something is to stand out - Main Button, Results Tables Headings etc 
INSERT INTO styles (name,style) VALUES('app-text-color', '#212121'); --Main text colour to use
INSERT INTO styles (name,style) VALUES('app-reverse-text-color', 'white'); --Text colour to use when writing on accent or primary colour backgrounds
INSERT INTO styles (name,style) VALUES('app-header-color',   'var(--app-primary-color)'); --Top Header Bar Colour
INSERT INTO styles (name,style) VALUES('app-spinner-color', 'var(--app-accent-color)'); --Spinner Dot Colour
INSERT INTO styles (name,style) VALUES('app-button-color', 'var(--app-accent-color)'); --Main Button Colour
INSERT INTO styles (name,style) VALUES('app-cancel-button-color', 'var(--app-primary-color)'); --Cancel Button Colour
INSERT INTO styles (name,style) VALUES('button-bird-color', 'invert(9%) sepia(23%) saturate(2922%) hue-rotate(213deg) brightness(92%) contrast(102%)'); --Colour of birds in the Send Button NOTE this is done by putting desired color in calcfilter.js .
INSERT INTO styles (name,style) VALUES('app-header-size', '64px'); --height of the main header bar
INSERT INTO styles (name,style) VALUES('default-icon-size', '24px'); --default icon size
INSERT INTO styles (name,style) VALUES('email-input-length','220px'); --input field width for e-mail input 

-- END OF STANDARD DATA ----------------------------------------------------------
-- INDEXES --------------------------------------------------------------

CREATE INDEX div_tid_idx ON div_winner_pick (tid);
CREATE INDEX div_uid_idx ON div_winner_pick(uid);
CREATE INDEX div_cid_idx ON div_winner_pick(cid);

CREATE INDEX wild_tid_idx ON wildcard_pick(tid);
CREATE INDEX wild_cid_idx ON wildcard_pick(cid);
CREATE INDEX wild_uid_idx ON wildcard_pick(uid);

CREATE INDEX tic_mp_idx ON team_in_competition(made_playoff);
CREATE INDEX tic_cid_idx ON team_in_competition(cid);

CREATE INDEX option_cid_rid_idx ON option(cid,rid);

CREATE INDEX round_open_idx ON round(open);

CREATE INDEX match_open_idx ON match (open);
CREATE INDEX match_cid_rid_idx ON match(cid,rid);
CREATE INDEX match_time_idx ON match (match_time);

CREATE INDEX answer_cid_rid_idx ON option_pick (cid,rid);
CREATE INDEX answer_uid_idx ON option_pick(uid);

CREATE INDEX pick_cid_rid_idx ON pick(cid,rid);
CREATE INDEX pick_uid_idx ON pick(uid);

CREATE INDEX registration_cid_idx ON registration(cid);


-- END OF INDEXES -------------------------------------------------------

-- Configuration Settings That are non standard - expect to edit this for each installation
-- THIS VERSION Just shows one example commented out 

-- UPDATE settings SET value = '../static/template/template.inc' WHERE name = 'template' ; 
-- UPDATE settings SET value = '../static/images/emoticons' WHERE name = 'emoticon_dir' ; 
-- UPDATE settings SET value = '/static/images/emoticons' wHERE name = 'emoticon_url'; 
-- UPDATE settings SET value = 'Baby Backups require special approval from the competition administrator ($$$). Please contact her/him <i>after registering</i> if you are a Baby Backup' wHERE name = 'msgguestnote';
-- UPDATE settings SET value = 'BB Approved' WHERE name = 'headingguestapproved'; 
-- UPDATE settings SET value = 'Is BB' WHERE name='headingisguest';

COMMIT;
VACUUM;
-- set it all up as Write Ahead Log for max performance and minimum contention with other users.
PRAGMA journal_mode=WAL;

