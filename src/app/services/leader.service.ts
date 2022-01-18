import { Injectable } from '@angular/core';
import { Leader } from '../shared/leader';
import { LEADERS } from '../shared/leaders';
import { of,Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class LeaderService {

  getLeaders(): Observable<Leader[]> {
    return of(LEADERS).pipe(delay(0));
  }

  getLeader(id: string): Observable<Leader> {
    return of(LEADERS.filter((lead) => (lead.id === id))[0]).pipe(delay(0));
  }

  getFeaturedLeader(): Observable<Leader> {
    return of(LEADERS.filter((lead) => lead.featured)[0]).pipe(delay(0));
  }
  constructor() { }
}
