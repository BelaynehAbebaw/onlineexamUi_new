
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:8080/api';

  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  // GET
  get(url: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}${url}`
    );
  }

  // POST
  post(url: string, data: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}${url}`,
      data,
      { headers: this.headers }
    );
  }

  // PUT
  put(url: string, data: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}${url}`,
      data,
      { headers: this.headers }
    );
  }

  // DELETE
  delete(url: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}${url}`
    );
  }
}
