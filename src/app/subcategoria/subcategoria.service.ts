import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';
import { MoneyHttp } from '../seguranca/money-http';

@Injectable()
export class SubcategoriaService {

  subCategoriaUrl: string;

  constructor(private http: MoneyHttp) {
    this.subCategoriaUrl = `${environment.apiUrl}/subcategorias`
  }

  listarTodas(): Promise<any> {
    return this.http.get(this.subCategoriaUrl)
      .toPromise();
  }
}
