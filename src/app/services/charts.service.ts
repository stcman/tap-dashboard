import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {

  http = inject(HttpClient);

  getTestData() {
    return this.http.get("./testdata.json");
  }
}
