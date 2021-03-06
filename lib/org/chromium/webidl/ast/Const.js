// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.chromium.webidl.ast',
  name: 'Const',
  extends: 'org.chromium.webidl.ast.MemberData',
  implements: [
    'org.chromium.webidl.ast.Named',
    'org.chromium.webidl.ast.Defaulted',
    'org.chromium.webidl.ast.Typed',
  ],

  properties: [
    {
      name: 'id',
      factory: function() {
        return this.getName();
      },
    },
  ],

  methods: [
    function outputWebIDL(o) {
      o.outputStrs('const ').outputObj(this.type).outputStrs(' ')
          .outputObj(this.name).outputStrs(' = ').outputObj(this.value)
          .outputStrs(';');
    },
  ],
});
