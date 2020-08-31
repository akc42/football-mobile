-- @licence
--  Copyright (c) 2020 Alan Chandler, all rights reserved

--  This file is part of Football Mobile.

--  Football Mobile is free software: you can redistribute it and/or modify
--  it under the terms of the GNU General Public License as published by
--  the Free Software Foundation, either version 3 of the License, or
--  (at your option) any later version.

--  Football Mobile is distributed in the hope that it will be useful,
--  but WITHOUT ANY WARRANTY; without even the implied warranty of
--  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
--  GNU General Public License for more details.

--  You should have received a copy of the GNU General Public License
--  along with Football Mobile.  If not, see <http://www.gnu.org/licenses/>.

--
-- Database version 14 (See copy of data to default_competition below) using sqlite
--

--
--  NOTE: There are a number of settings in the Settings table that are just example values.  There is a list at the end of this file that
--        you MUST change, but the recommendation is to review off of them, and the settings in the style table to check they meet your needs.


BEGIN EXCLUSIVE;

CREATE TABLE competition (
    cid integer PRIMARY KEY ASC, --Competition ID - 
    name character varying,--This is the name that appears in the header for the competition
    administrator integer  NOT NULL DEFAULT 0, --The uid of the administrator
    team_lock boolean NOT NULL DEFAULT 0, --Says whether teams in competition are all set
    open boolean NOT NULL DEFAULT 0 , --Says whether a user may see the competition
    closed boolean NOT NULL DEFAULT 0, --Says where a user may  still register 
    expected_date bigint NOT NULL DEFAULT 0, --expected open date (0 if we don't know) only valid if not open
    condition text DEFAULT NULL,	--This is the text that a user has to agree to in order to register himself for the competition
    pp_deadline bigint DEFAULT 0 NOT NULL, --Playoff Selection Deadline 0 if no selection
    gap integer DEFAULT 5 NOT NULL, --Minutes to go before match to make pick deadline
    update_date bigint NOT NULL DEFAULT (strftime('%s','now')), --Date Competition Created or data other than results_cache updated
    default_points INTEGER NOT NULL DEFAULT 1, -- default picks value used when creating a new round
    default_bonus INTEGER NOT NULL DEFAULT 2, --default value of question bonus (bvalue) when new round created
    default_underdog INTEGER NOT NULL DEFAULT 1, --default additional points if a match is designated underdog
    default_playoff INTEGER NOT NULL DEFAULT 1,  --default points allocated to a team in competition if they make the playoff. 
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
CREATE TABLE membership_request (
    mid INTEGER PRIMATY_KEY ASC,
    request_time INTEGER DEFAULT  (strftime('%s','now')) NOT NULL, --Time of Request
    computer CHARACTER VARYING,  -- session id of memebership request
    email CHARACTER VARYING COLLATE NOCASE, --email used for the request
    ipaddress CHARACTER VARYING --ip address of requester
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
    opid integer NOT NULL , --ID of Question Option Selected as Correct 
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
    email character varying COLLATE NOCASE,
    password character varying, --stores bycrpted hash of password;
    last_logon bigint DEFAULT (strftime('%s','now')) NOT NULL, --last time user connected
    member_approve boolean DEFAULT 0 NOT NULL,--Set true if user may approve membership
    global_admin boolean DEFAULT 0 NOT NULL, -- Set true if user is global admin (automatically allows approve membership)
    unlikely boolean DEFAULT 0 NOT NULL, --Set true if this user is unlikely to ever return.  I won't prevent then, but we can use it to check all expected users have re-registerd
    verification_key character varying, --This is 
    -- The bcryted hash of the random pin created when sending verification emails, for lost password, and email changes. 
    -- (in the case of e-mail changes the new e-mail will be added to the token sent to the verifier so its not necessary to store it here).
    verification_sent bigint DEFAULT (strftime('%s','now')) NOT NULL, -- The time verification sent (so can rate limit and expire old ones). 
    waiting_approval boolean DEFAULT false NOT NULL, --awaiting membership approval
    reason character varying, --the text the user has supplied to endorse their membership or the reason the unlikely flag is set
    remember boolean DEFAULT false NOT NULL --user has agreed to allow cookies to remember their log on
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
    subscribed boolean DEFAULT 0 NOT NULL, --Set if has user wants to receive e-mail notifications of Picks being due
    PRIMARY KEY (cid,uid)
);

-- Round in Competition
CREATE TABLE round (
    cid integer NOT NULL REFERENCES competition(cid) ON UPDATE CASCADE ON DELETE CASCADE, -- Competition ID
    rid integer NOT NULL, --Round Number
    question text, --Bonus Question Text
    comment text, -- Administrator comment on the bonus question
    valid_question boolean DEFAULT 0, --Set once a valid bonus question has been set up
    answer integer, --If not null opid of correct answer to question
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

CREATE TABLE team (
    tid varchar(3) PRIMARY KEY,
    name character varying(50) NOT NULL,
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

INSERT INTO team (tid, name, logo,  confid, divid) VALUES('NE','New England Patriots','AFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('NYG','New York Giants','NFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('TEN','Tennessee Titans','AFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('IND','Indianapolis Colts','AFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('DAL','Dallas Cowboys','NFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('WAS','Washington Redskins','NFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('SEA','Seattle Seahawks','NFC','W');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('ATL','Atlanta Falcons','NFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('CIN','Cincinnati Bengals','AFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('MIA','Miami Dolphins','AFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('CAR','Carolina Panthers','NFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('TB','Tampa Bay Buccaneers','NFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('BUF','Buffalo Bills','AFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('PHI','Philadelphia Eagles','NFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('NO','New Orleans Saints','NFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('CHI','Chicago','NFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('JAC','Jacksonville Jaguars','AFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('HOU','Houston Texans','AFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('SF','San Francisco 49ers','NFC','W');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('CLE','Cleveland Browns','AFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('PIT','Pittsburgh Steelers','AFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('BAL','Baltimore Ravens','AFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('DET','Detroit Lions','NFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('GB','Green Bay Packers','NFC','N');

INSERT INTO team (tid, name, logo,  confid, divid) VALUES('OAK','Oakland Raiders','AFC','W');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('MIN','Minnesota Vikings','NFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('DEN','Denver Broncos','AFC','W');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('NYJ','New York Jets','AFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('ARI','Arizona Cardinals','NFC','W');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('KC','Kansas City Chiefs','AFC','W');
INSERT INTO team (tid, name, logo, confid, divid) VALUES('LAC', 'Los Angeles Chargers','AFC','W');
INSERT INTO team (tid, name, logo, confid, divid) VALUES ('LAR', 'Los Angeles Rams','NFC', 'W');


-- END OF STANDARD DATA ----------------------------------------------------------
-- INDEXES --------------------------------------------------------------

CREATE UNIQUE INDEX part_email_idx ON participant(email);

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

-- SPECIFIC SETTINGS FOR THIS VERSION OF THE SOFTWARE.

INSERT INTO settings (name,value) VALUES('version',14); --version of this configuration
-- values for client config

INSERT INTO settings (name,value) VALUES('client_log',''); --if none empty string should specify colon separated function areas client should log or 'all' for every thing.
INSERT INTO settings (name,value) VALUES('client_log_uid',0); --if non zero limit client logging to that uid.
INSERT INTO settings (name,value) VALUES('main_menu_icon','menu'); --character from material icon font to use as the main menu.
INSERT INTO settings (name,value) VALUES('webmaster','webmaster@example.com'); --site webmaster.
INSERT INTO settings (name,value) VALUES('site_logo','/appimages/site_logo.png'); --url of the site_logo image to be used on info pages and in mail
INSERT INTO settings (name,value) VALUES('min_pass_len', 6); --minimum password length
INSERT INTO settings (name,value) VALUES('dwell_time', 2000); --time to elapse before new urls get to be pushed to the history stack
INSERT INTO settings (name,value) VALUES('recaptcha_key',''); --stardard recaptcha key for the recapcha element
INSERT INTO settings (name,value) VALUES('organisation_name', 'Football Mobile Organisation'); --Name of Organisation running the site.
INSERT INTO settings (name,value) VALUES('coming_soon_message','Your new picking competition will be coming soon, get ready to register and join.'); -- First Paragraph of text for a coming soon page
--values for server config
INSERT INTO settings (name,value) VALUES('cache_age',0);--cache age before invalid (in hours), 0 is infinite
INSERT INTO settings (name,value) VALUES('server_port', 2040); --port the api server should listen on.
INSERT INTO settings (name,value) VALUES('cookie_name', 'MBBall'); --name used for our main cookie
INSERT INTO settings (name,value) VALUES('cookie_key', 'newCookieKey'); --key used to encrypt/decrypt cookie token
INSERT INTO settings (name,value) VALUES('cookie_expires', 720); --hours until expire for standard logged on token
INSERT INTO settings (name,value) VALUES('recaptch_secret','');  -- secret key or verification of recaptcha.
INSERT INTO settings (name,value) VALUES('verify_expires', 24); --hours until expire for verification tokens.
INSERT INTO settings (name,value) VALUES('rate_limit', 30); --minutes that must elapse between verification emails
INSERT INTO settings (name,value) VALUES('membership_rate', 60); --minutes that must elapse between membership requests
INSERT INTO settings (name,value) VALUES('max_membership', 3); --max membership requests from same computer in a month
INSERT INTO settings (name,value) VALUES('membership_key','FMMember'); --key for sid generation
INSERT INTO settings (name,value) VALUES('email_from', 'admin@example.com'); --email address that mail comes from (do not reply)
INSERT INTO settings (name,value) VALUES('mail_footer','<p>Some footer html</p>'); --mail footer
INSERT INTO settings (name,value) VALUES('mail_wordwrap',130); --word wrap column in html to text conversion
INSERT INTO settings (name,value) VALUES('mail_signature', '/appimages/signature.png;Name of Signature'); --email signature if starts with a slash is an image url which maybe followed by a semi-colon and then caption, else html
INSERT INTO settings (name,value) VALUES('site_baseref','https://example.com'); -- basic site url without trailing slash to be added to hostless image urls to make complete


-- Configuration Settings That are just examples and MUST be changed.  There are others that you might want to change so review them all.
-- 
-- UPDATE settings SET value = 'https://example.com' WHERE name = 'site_baseref'
-- UPDATE settings SET value = 'webmaster@example.com' WHERE name = 'webmaster';
-- UPDATE settings SET value = 'admin@example.com' WHERE name = 'email_from';
-- UPDATE settings SET valie = '<p>mail footer</p>' WHERE name = 'mail_footer';
-- UPDATE settings SET value = '/images/signature.png;Joe Bloggs' WHERE name = 'mail_signature';     --NOTE, site specific images should be in a different directory
-- UPDATE settings SET value = '/images/site_logo.png' WHERE name = 'site_logo';                    --As above.
-- UPDATE settings SET value = 'newCookieKey' WHERE name = 'cookie_key';
-- UPDATE settings SET value = 'recaptcha_key' WHERE name = 'recaptcha_key';
-- UPDATE settings SET value = 'recaptcha_secret_key' WHERE name = 'recaptcha_secret';
-- UPDATE settings SET value = 'Football Mobile Organisation' WHERE name = 'organisation_name';
-- UPDATE settings SET value = 'Your new picking competition will be coming soon, get ready to register and join.' WHERE NAME 'coming_soon_message';
VACUUM;
-- set it all up as Write Ahead Log for max performance and minimum contention with other users.
PRAGMA journal_mode=WAL;

