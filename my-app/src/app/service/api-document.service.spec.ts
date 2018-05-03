import { TestBed, inject } from '@angular/core/testing';

import { ApiDocumentService } from './api-document.service';

describe('ApiDocumentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiDocumentService]
    });
  });

  it('should be created', inject([ApiDocumentService], (service: ApiDocumentService) => {
    expect(service).toBeTruthy();
  }));
});
