import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MessageService } from 'primeng/api';

import { ErrorHandlerService } from './../../core/error-handler.service';
import { CategoriaService } from './../../categorias/categoria.service';
import { PessoaService } from './../../pessoas/pessoa.service';
import { LancamentoService } from './../lancamento.service';
import { ContaService } from './../../contas/conta.service';
import { FormapagamentoService } from './../../formapagamentos/formapagamento.service';
import { SubcategoriaService } from './../../subcategoria/subcategoria.service';

@Component({
  selector: 'app-lancamento-cadastro',
  templateUrl: './lancamento-cadastro.component.html',
  styleUrls: ['./lancamento-cadastro.component.css']
})
export class LancamentoCadastroComponent implements OnInit, OnChanges {

  tipos = [
    { label: 'Receita', value: 'RECEITA' },
    { label: 'Despesa', value: 'DESPESA' },
    { label: 'Investimento', value: 'INVESTIMENTO' }
  ];

  categorias = [];
  subCategorias = [];
  pessoas = [];
  contas = [];
  formasPagamento = [];
  formulario: FormGroup;
  uploadEmAndamento = false;

  @Input() idLancamento: number;
  @Output() display = new EventEmitter;

  constructor(
    private contaService: ContaService,
    private formaPagamentoService: FormapagamentoService,
    private categoriaService: CategoriaService,
    private subCategoriaService: SubcategoriaService,
    private pessoaService: PessoaService,
    private lancamentoService: LancamentoService,
    private messageService: MessageService,
    private errorHandler: ErrorHandlerService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    // this.configurarFormulario();

    // const codigoLancamento = this.route.snapshot.params['codigo'];

    // this.title.setTitle('Novo lançamento');

    // if (codigoLancamento) {
    //  this.carregarLancamento(codigoLancamento);
    // }

    this.carregarContas();
    this.carregarFormasPagamento();
    this.carregarCategorias();
    this.carregarSubCategorias();
    this.carregarPessoas();
  }

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    this.configurarFormulario();

    if (this.idLancamento) {
      this.carregarLancamento(this.idLancamento);
    }
  }

  antesUploadAnexo(event) {
    event.xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));

    this.uploadEmAndamento = true;
  }

  aoTerminarUploadAnexo(event) {
    const anexo = JSON.parse(event.xhr.response);

    this.formulario.patchValue({
      anexo: anexo.nome,
      urlAnexo: anexo.url
    });

    this.uploadEmAndamento = false;
  }

  erroUpload(event) {
    this.messageService.add({ severity: 'error', detail: 'Erro ao tentar enviar anexo!' });

    this.uploadEmAndamento = false;
  }

  removerAnexo() {
    this.formulario.patchValue({
      anexo: null,
      urlAnexo: null
    });
  }

  get nomeAnexo() {
    const nome = this.formulario.get('anexo').value;

    if (nome) {
      return nome.substring(nome.indexOf('_') + 1, nome.length);
    }

    return '';
  }

  get urlUploadAnexo() {
    return this.lancamentoService.urlUploadAnexo();
  }

  configurarFormulario() {
    this.formulario = this.formBuilder.group({
      codigo: [],
      conta: this.formBuilder.group({
        codigo: [ null, Validators.required ],
        nome: []
      }),
      tipo: [ 'RECEITA', Validators.required ],
      dataVencimento: [ null, Validators.required ],
      dataPagamento: [],
      formaPagamento: this.formBuilder.group({
        codigo: [ null, Validators.required ],
        nome: []
      }),
      categoria: this.formBuilder.group({
        codigo: [ null, Validators.required ],
        nome: []
      }),
      subCategoria: this.formBuilder.group({
        codigo: [ null, Validators.required ],
        nome: []
      }),
      pessoa: this.formBuilder.group({
        codigo: [ null, Validators.required ],
        nome: []
      }),
      valor: [ null, Validators.required ],
      observacao: [],
      anexo: [],
      urlAnexo: []
    });
  }

  validarObrigatoriedade(input: FormControl) {
    return (input.value ? null : { obrigatoriedade: true });
  }

  validarTamanhoMinimo(valor: number) {
    return (input: FormControl) => {
      return (!input.value || input.value.length >= valor) ? null : { tamanhoMinimo: { tamanho: valor } };
    };
  }

  get editando() {
    return Boolean(this.formulario.get('codigo').value);
  }

  carregarLancamento(codigo: number) {
    this.lancamentoService.buscarPorCodigo(codigo)
      .then(lancamento => {
        this.formulario.patchValue(lancamento);
        // this.atualizarTituloEdicao();
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  salvar() {
    if (this.editando) {
      this.atualizarLancamento();
    } else {
      this.adicionarLancamento();
    }
  }

  adicionarLancamento() {
    this.lancamentoService.adicionar(this.formulario.value)
      .then(() => {
        this.messageService.add({ severity: 'success', detail: 'Lançamento adicionado com sucesso!' });
        this.finalizar();
        // this.router.navigate(['/lancamentos', lancamentoAdicionado.codigo]);
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  atualizarLancamento() {
    this.lancamentoService.atualizar(this.formulario.value)
      .then(() => {
        this.messageService.add({ severity: 'success', detail: 'Lançamento alterado com sucesso!' });
        this.finalizar();
        // this.atualizarTituloEdicao();
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  finalizar() {
    this.configurarFormulario();
    this.display.emit(false);
  }

  carregarContas() {
    return this.contaService.listarTodas()
      .then(contas => {
        this.contas = contas
          .map(c => ({ label: c.nome, value: c.codigo }));
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  carregarFormasPagamento() {
    return this.formaPagamentoService.listarTodas()
      .then(formasPagamento => {
        this.formasPagamento = formasPagamento
          .map(c => ({ label: c.nome, value: c.codigo }));
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  carregarCategorias() {
    return this.categoriaService.listarTodas()
      .then(categorias => {
        this.categorias = categorias
          .map(c => ({ label: c.nome, value: c.codigo }));
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  carregarSubCategorias() {
    return this.subCategoriaService.listarTodas()
      .then(subCategorias => {
        this.subCategorias = subCategorias
          .map(c => ({ label: c.nome, value: c.codigo }));
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  carregarPessoas() {
    this.pessoaService.listarAll()
      .then(pessoas => {
        this.pessoas = pessoas
          .map(p => ({ label: p.nome, value: p.codigo }));
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  // novo() {
  //  this.formulario.reset();

  //  setTimeout(function() {
  //    this.lancamento = new Lancamento();
  //  }.bind(this), 1);

  //  this.router.navigate(['/lancamentos/novo']);
  // }

  // atualizarTituloEdicao() {
  //  this.title.setTitle(`Edição de lançamento: ${this.formulario.get('codigo').value}`);
  // }
}
