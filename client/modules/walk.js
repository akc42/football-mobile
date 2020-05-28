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

function _walk(node,criteria, slot) {
  if (node.assignedSlot === null || node.assignedSlot === slot) {
    if (node.localName === 'slot') {
      const assignedNodes = node.assignedNodes();
      if (assignedNodes.length  === 0) {
        _walkA(node.children, criteria);
      } else {
        _walkA(assignedNodes.filter(n => n.nodeType === Node.ELEMENT_NODE), criteria, node);
      }
    } else if (!criteria(node)) {
      if (customElements.get(node.localName)) _walkA(node.shadowRoot.children,criteria);
      _walkA(node.children, criteria);
    }
  }
}
function _walkA(nodes,criteria, slot) {
  for (let n of nodes) {
    _walk(n,criteria, slot);
  }
}
export default function walk(walknode, criteria) {
  _walk(walknode,criteria,null);
}
