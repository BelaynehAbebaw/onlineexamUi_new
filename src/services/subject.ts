
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services/ApiService';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {

  constructor(private api: ApiService) {}

  getSubjects(): Observable<any> {
    return this.api.get('/subjects');
  }

  addSubject(subject: any): Observable<any> {
    return this.api.post('/subjects', subject);
  }

  updateSubject(id: number, subject: any): Observable<any> {
    return this.api.put(`/subjects/${id}`, subject);
  }

  deleteSubject(id: number): Observable<any> {
    return this.api.delete(`/subjects/${id}`);
  }
}
