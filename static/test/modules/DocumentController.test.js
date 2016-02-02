describe('DocumentController', function() {
    'use strict';
    let $controller, scope, rootScope;

    let mockDocService = {
        list: function() {
            let p = new Promise(
                function(resolve, reject) {
                    resolve(['uno', 'due']);
                }
            );
            return p;
        }
    };


    beforeEach(module('teapot.modules.docArea'));

    beforeEach(function() {
        // Inject mock dependencies
        inject(function(_$controller_, _$rootScope_) {
            rootScope = _$rootScope_.$new();
            $controller = _$controller_('DocumentController', {
                $scope: scope,
                $rootScope: rootScope,
                documentService: mockDocService
            });
        })
    });

    describe('Initialization', function() {
        it('After _init() runs, this.docs contains an array of documents', function(done) {
            // wait for fake promise to resolve
            setTimeout(function() {
                expect($controller.docs[0]).toBe('uno');
                expect($controller.docs[1]).toBe('due');
                done();
            }, 1);
        });
    });

    describe('Load Document', function() {
        it('Fires a change_document event', function() {

            spyOn(rootScope, '$broadcast');
            let url = 'URL';
            let doi = 'DOI';

            $controller.load(url, doi);

            // Expect to receive a broadcast
            expect(rootScope.$broadcast)
                .toHaveBeenCalledWith('change_document', {
                    'doc_url': url,
                    'doc_doi': doi
                });
        });
    });

});
