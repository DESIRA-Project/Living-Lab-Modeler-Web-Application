// https://angular.io/guide/http#testing-http-requests

import { TestBed } from '@angular/core/testing';

import { ActivityService } from './activity.service';
import {HttpClient} from "@angular/common/http";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";


describe('ActivityService', () => {
  let service: ActivityService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ActivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return expected activities', (done: DoneFn) => {
    const expectedLivingLabId = 1;
    const expectedActivities: any[] = [
      {id: 1, title: 'Activity 1', livingLabId: expectedLivingLabId},
    ];

    service.get(expectedLivingLabId, expectedActivities[0].id).subscribe(
      response => {
        expect(response)
          .withContext('expected activities')
          .toEqual(expectedActivities);
        done();
      },
      error => done.fail
    );

    // The following `expectOne()` will match the request's URL.
    // If no requests or multiple requests matched that URL
    // `expectOne()` would throw.
    const req = httpTestingController.expectOne(
      service.url + '/' + expectedLivingLabId + '/' + service.urlActivityExtension + '/' + expectedActivities[0].id
    );

    // Assert that the request is a GET.
    expect(req.request.method).toEqual('GET');

    // Respond with mock data, causing Observable to resolve.
    // Subscribe callback asserts that correct data was returned.
    req.flush(expectedActivities);

  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

});
