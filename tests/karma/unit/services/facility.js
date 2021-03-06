describe('Facility service', function() {

  'use strict';

  var service,
      DbView;

  beforeEach(function() {
    module('inboxApp');
    DbView = sinon.stub();
    module(function($provide) {
      $provide.value('DbView', DbView);
      $provide.value('Cache', function(options) {
        return options.get;
      });
      $provide.value('PLACE_TYPES', [ 'district_hospital', 'health_center', 'clinic' ]);
    });
    inject(function($injector) {
      service = $injector.get('Facility');
    });
  });

  it('returns errors from request', function(done) {
    DbView.returns(KarmaUtils.mockPromise('boom'));
    service({}, function(err) {
      chai.expect(err).to.equal('boom');
      done();
    });
  });

  it('returns zero when no facilities', function(done) {
    DbView.returns(KarmaUtils.mockPromise(null, { results: [] }));
    service({}, function(err, actual) {
      chai.expect(err).to.equal(null);
      chai.expect(actual).to.deep.equal([]);
      done();
    });
  });

  it('returns all clinics when no user district', function(done) {

    var clinicA = {
      _id: '920a7f6a-d01d-5cfe-7c9182fe6551322a',
      _rev: '2-55151d808dacc7f12fdd1513f2eddc75',
      type: 'clinic',
      name: 'Maori Hill',
      parent: {
        _id: 'a301463e-74ba-6e2a-3424d30ef5089a7f',
        _rev: '6-ef6e63875cb6322e48e3f964f460bd7a',
        type: 'health_center',
        name: 'Dunedin',
        parent: {
          _id: 'a301463e-74ba-6e2a-3424d30ef5087d1c',
          _rev: '3-42c1cfd045c5d80dd98ccc85c47f44ae',
          type: 'district_hospital',
          name: 'Otago',
          parent: {},
          contact: {
            name: 'Ralph',
            phone: '555'
          }
        },
        contact: {
          name: 'Sharon',
          phone: '556'
        }
      }
    };

    var clinicB = {
      _id: 'a301463e-74ba-6e2a-3424d30ef508a488',
      _rev: '74-30d4791ba64f13592f86023344fa9449',
      type: 'clinic',
      name: 'Andy Bay',
      contact: {
        name: 'Gareth',
        phone: '557557557'
      },
      parent: {
        _id: 'a301463e-74ba-6e2a-3424d30ef5089a7f',
        _rev: '6-ef6e63875cb6322e48e3f964f460bd7a',
        type: 'health_center',
        name: 'Dunedin',
        parent: {
          _id: 'a301463e-74ba-6e2a-3424d30ef5087d1c',
          _rev: '3-42c1cfd045c5d80dd98ccc85c47f44ae',
          type: 'district_hospital',
          name: 'Otago',
          parent: {},
          contact: {
            name: 'Ralph',
            phone: '555'
          }
        },
        contact: {
          name: 'Sharon',
          phone: '556'
        }
      },
      sent_forms: {
        R: '2014-07-10T02:10:28.776Z',
        STCK: '2014-07-09T23:28:45.949Z',
        XXXXXXX: '2014-07-01T00:46:24.362Z',
        '\u00e0\u00a4\u2014': '2014-07-02T02:06:32.270Z',
        ANCR: '2014-07-10T02:58:53.095Z'
      }
    };

    var healthCenter = {
      _id: '920a7f6a-d01d-5cfe-7c9182fe65516194',
      _rev: '4-d7d7e3ab5276fbd1bc9c9ca6b10f4ee1',
      type: 'health_center',
      name: 'Sumner',
      parent: {
        _id: '920a7f6a-d01d-5cfe-7c9182fe6551510e',
        _rev: '2-5b71b72299224c2500389db753116155',
        type: 'district_hospital',
        name: 'Christchurch',
        sent_forms: {
          R: '2014-06-30T04:08:06.657Z'
        }
      }
    };

    DbView.withArgs('facilities', {params: {include_docs: true, key: ['clinic']}}).returns(KarmaUtils.mockPromise(null, { results: [ clinicA, clinicB ] }));
    DbView.withArgs('facilities', {params: {include_docs: true, key: ['health_center']}}).returns(KarmaUtils.mockPromise(null, { results: [ healthCenter ] }));

    service({ types: ['clinic'] }, function(err, actual) {
      chai.expect(err).to.equal(null);
      chai.expect(actual).to.deep.equal([ clinicA, clinicB ]);
      done();
    });
  });

});
