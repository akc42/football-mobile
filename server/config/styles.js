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

  module.exports = async function(db) {
    debug('got a styles request');
    await db.exec('BEGIN TRANSACTION')
    const s = await db.prepare('SELECT style FROM styles WHERE name = ?');
    const {style: app_primary_color} = await s.get('app-primary-color');
    const {style: app_accent_color} = await s.get('app-accent-color');
    const {style: app_text_color} = await s.get('app-text-color');
    const {style: app_reverse_text_color} = await s.get('app-reverse-text-color');
    const {style: app_header_color} = await s.get('app-header-color');
    const {style: app_spinner_color} = await s.get('app-spinner-color');
    const {style: app_button_color} = await s.get('app-button-color');
    const { style: button_text_color } = await s.get('button-text-color');
    const {style: app_cancel_button_color} = await s.get('app-cancel-button-color');
    const { style: cancel_button_text_color } = await s.get('cancel-button-text-color');
    const {style: primary_color_filter} = await s.get('primary-color-filter');
    const {style: app_header_size } = await s.get('app-header-size');
    const { style: default_icon_size} = await s.get('default-icon-size');
    const { style: email_input_length } = await s.get('email-input-length');
    await s.finalize();
    const styles = {
      app_primary_color:app_primary_color,
      app_accent_color:app_accent_color,
      app_text_color:app_text_color,
      app_reverse_text_color:app_reverse_text_color,
      app_header_color:app_header_color,
      app_spinner_color:app_spinner_color,
      app_button_color:app_button_color,
      button_text_color: button_text_color,
      app_cancel_button_color:app_cancel_button_color,
      cancel_button_text_color: cancel_button_text_color,
      primary_color_filter:primary_color_filter,
      app_header_size:app_header_size,
      default_icon_size: default_icon_size,
      email_input_length: email_input_length
    }; 
    await db.exec('COMMIT');   
    debug('got styles');
    return styles;
  };
})();