import { Params } from '@angular/router';
import { ReplaySubject } from 'rxjs';

export class ActivatedRouteStub {
  private paramsSubject = new ReplaySubject<Params>();
  private queryParamsSubject = new ReplaySubject<Params>();
  private fragmentSubject = new ReplaySubject<string>();

  constructor() {}

  readonly params = this.paramsSubject.asObservable();

  setParams(params: Params = {}) {
    this.paramsSubject.next(params);
  }

  readonly queryParams = this.queryParamsSubject.asObservable();

  setQueryParams(params: Params = {}) {
    this.queryParamsSubject.next(params);
  }

  readonly fragment = this.fragmentSubject.asObservable();

  setFragment(fragment: string) {
    this.fragmentSubject.next(fragment);
  }
}
