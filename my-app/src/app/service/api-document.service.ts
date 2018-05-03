import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable()
export class ApiDocumentService {
  
  private url = 'http://test.testmtm.saigontechnology.vn/api/NewRunSheet/ApiGetGetMasterData?model.date=04%2F26%2F2018';

  constructor(private http: Http) { }

  getApi(): Observable<any[]> {
    return this.http.get(this.url).map((response: Response) => response.json())
  }

  deleteApi(): Observable<any[]>{
    return this.http.delete(this.url).map((reponse: Response) => reponse.json())
  }

}

