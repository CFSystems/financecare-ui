import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';
import { MoneyHttp } from '../seguranca/money-http';

@Injectable()
export class ContaService {

  contasUrl: string;

  constructor(private http: MoneyHttp) {
    this.contasUrl = `${environment.apiUrl}/contas`
  }

  listarTodas(): Promise<any> {
    return this.http.get(this.contasUrl)
      .toPromise();
  }
}
