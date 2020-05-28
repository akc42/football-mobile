/**
    @licence
    Copyright (c) 2019 Alan Chandler, all rights reserved

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

import {css} from '../libs/lit-element.js';

export default  css`
        :host {
          display: block;
          margin-bottom: 10px;
          margin-top: 10px
        }
        input, textarea {
          border-left: none;
          border-right: none;
          border-top: none;
          border-bottom: 1px solid grey;
          position: relative;
          font-family: Roboto, sans-serif;
          padding: 2px 0;
          margin: 0 2px 10px 2px;
          width: 100%;
          box-sizing: border-box;
        }
        input:focus, textarea:focus {
          outline: none;
        }
        input:valid:focus, textarea:valid:focus {
          border-bottom-color: var(--pas-input-focus-colour, blue);
        }
        input:invalid, textarea:invalid {
          border-bottom-color: red;
        }
        textarea {
          resize: none;
          height: 5em;
        }
        .error {
          color: red;
        }
        div.errorcontainer {
          position: relative
        }
        div.error {
          position: absolute;
          left: 2px;
          top: -10px;
          font-size: 8pt;
        }
        label {
          display:block;
          transform: translate(5px, 20px);
          transition: 0.5s ease-in-out;
          font-size: 8pt;
        }
        label.inplace {
          transform: translate(0,0);
          font-size: 10pt;
        }
`;
