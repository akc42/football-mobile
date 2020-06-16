/**
@licence
    Copyright (c) 2020 Alan Chandler, all rights reserved

    This file is part of Football Mobile.

    Football Mobile is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Football Mobile is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Football Mobile.  If not, see <http://www.gnu.org/licenses/>.
*/

(function() {
  'use strict';
  const debug = require('debug')('football:api:styles');
  const db = require('../utils/database');

  module.exports = async function() {
    debug('got a styles request');
    const styles = {};
    const s = db.prepare('SELECT style FROM styles WHERE name = ?').pluck();
    db.transaction(() => {
      styles.app_primary_color = s.get('app-primary-color');
      styles.app_accent_color = s.get('app-accent-color');
      styles.app_text_color = s.get('app-text-color');
      styles.app_reverse_text_color = s.get('app-reverse-text-color');
      styles.app_header_color = s.get('app-header-color');
      styles.app_spinner_color = s.get('app-spinner-color');
      styles.app_button_color = s.get('app-button-color');
      styles.button_text_color = s.get('button-text-color');
      styles.app_cancel_button_color = s.get('app-cancel-button-color');
      styles.cancel_button_text_color = s.get('cancel-button-text-color');
      styles.primary_color_filter = s.get('primary-color-filter');
      styles.app_header_size = s.get('app-header-size');
      styles.default_icon_size = s.get('default-icon-size');
      styles.email_input_length = s.get('email-input-length');
      styles.pw_input_length = s.get('pw-input-length');
      styles.name_input_length = s.get('name-input-length');
    })();
    debug('got styles');
    return styles;
  };
})();