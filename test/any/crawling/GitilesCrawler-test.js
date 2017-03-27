// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

describe('GitilesCrawler', function() {
  var GitilesCrawler;
  var GitilesRequest;
  var GitilesRequestType;
  var testCtx;

  beforeEach(function() {
    testCtx = foam.__context__.createSubContext({});
    testCtx.register(
        testCtx.lookup('org.chromium.webidl.crawlers.test.FakeHTTPRequest'),
        'foam.net.HTTPRequest');

    GitilesCrawler = testCtx.lookup('org.chromium.webidl.crawlers.GitilesCrawler');
    GitilesRequest = testCtx.lookup('org.chromium.webidl.crawlers.GitilesRequest');
    GitilesRequestType =
        testCtx.lookup('org.chromium.webidl.crawlers.GitilesRequestType');
  });

  function verifyDir(json) {
    expect(json instanceof Object).toBe(true);
    expect(json.id.match(/^[0-9a-fA-F]+$/)).toBeTruthy();
    expect(Array.isArray(json.entries)).toBe(true);
    expect(json.entries.filter(function(entry) {
      return entry.name &&
          (entry.type === 'blob' || entry.type === 'tree');
    })).toEqual(json.entries);
    return json;
  }

  it('should translate master branch to commit hash', function(done) {
    GitilesCrawler.create({
      baseURL: 'https://chromium.googlesource.com/chromium/src/+',
      commit: 'master',
      basePath: '',
    }, testCtx).branchToCommit_().then(function(crawler) {
      expect(crawler.commit).toMatch(/^[0-9a-fA-F]+$/);
      done();
    });
  });
  it('should start/end without any files when filtering everything out', function(done) {
    var crawler = GitilesCrawler.create({
      baseURL: 'https://chromium.googlesource.com/chromium/src/+',
      commit: 'master',
      basePath: '',
      acceptDir: function() { return false; },
      acceptFile: function() { return false; },
    }, testCtx);
    var starts = 0;
    var files = 0;
    var ends = 0;

    crawler.start.sub(function() { starts++; });
    crawler.file.sub(function() { files++; });
    crawler.end.sub(function() { ends++; });

    crawler.run();

    setTimeout(function() {
      expect(starts).toBe(1);
      expect(files).toBe(0);
      expect(ends).toBe(1);
      done();
    }, 0);
  });
  it('should produce nothing but LICENSE file when configured as such', function(done) {
    var license;
    var baseURL = 'https://chromium.googlesource.com/chromium/src/+';
    var commit = 'master';
    var filePath = 'LICENSE';
    GitilesRequest.create({
      baseURL: baseURL,
      commit: commit,
      path: filePath,
      type: GitilesRequestType.FILE,
    }, testCtx).send().then(function(license) {
      var crawler = GitilesCrawler.create({
        baseURL: baseURL,
        commit: commit,
        basePath: '',
        acceptDir: function(path) { return path === ''; }, // Root dir only.
        acceptFile: function(path) { return path === filePath; },
      }, testCtx);

      var count = 0;
      crawler.file.sub(function(_, __, file) {
        expect(count).toBe(0);
        expect(file.path).toBe(filePath);
        expect(file.contents).toBe(license);
        count++;
      });

      crawler.run();

      setTimeout(function() {
        expect(count).toBe(1);
        done();
      }, 0);
    });
  });
});