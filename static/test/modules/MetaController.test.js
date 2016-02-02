describe('MetaController', function() {
    'use strict';
    let $controller, scope;

    let mockAnnotationService = {
        query: function(url) {
            let p = new Promise(
                function(resolve, reject) {
                    resolve({body:['uno', 'due', url]});
                }
            );
            return p;
        },tidy: function(data) {
            return data
        }
    };

    beforeEach(module('teapot.modules.metaArea'));

    beforeEach(function() {
        // Inject mock dependencies
        inject(function(_$controller_, _$rootScope_) {
            scope = _$rootScope_.$new();
            $controller = _$controller_('MetaController', {
                $scope: scope,
                annotationService: mockAnnotationService
            });
        })
    });

    describe('Annotation loading', function() {
        it('After a change_document event, a new set of annotation is loaded', function(done) {
            // Annotations starts empty
            expect($controller.annotations).toEqual({});
            // Event fires
            scope.$broadcast('change_document', {doc_url:'tre', doc_doi:'b'});
            // After a few milliseconds, annotations are updated
            setTimeout(function() {
                expect($controller.annotations).toEqual(['uno', 'due', 'tre']);
                done();
            }, 2);
      });
    });
});

