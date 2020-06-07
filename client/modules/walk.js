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
