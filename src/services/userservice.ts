
import { Injectable, inject } from '@angular/core';
import { ApiService } from './ApiService';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Userservice {

  private apiService = inject(ApiService);

  createUser(user: any): Observable<any> {
    return this.apiService.post('/users', user);
  }

  updateUser(id: number, user: any): Observable<any> {
    return this.apiService.put(`/users/${id}`, user);
  }

  deleteUser(id: number): Observable<any> {
    return this.apiService.delete(`/users/${id}`);
  }

  getUser(id: number): Observable<any> {
    return this.apiService.get(`/users/${id}`);
  }

  getUsers(): Observable<any> {
    return this.apiService.get('/users');
  }
}
