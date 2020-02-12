import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';
import { MoneyHttp } from '../seguranca/money-http';

@Injectable()
export class FormapagamentoService {

  formasPagamentoUrl: string;

  constructor(private http: MoneyHttp) {
    this.formasPagamentoUrl = `${environment.apiUrl}/formapagamento`
  }

  listarTodas(): Promise<any> {
    return this.http.get(this.formasPagamentoUrl)
      .toPromise();
  }
}
