/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import axios, { AxiosError } from 'axios';
import { SearchJobsDto } from './dto/search-jobs.dto';

// Mock do axios para evitar requisições HTTP reais nos testes
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Adiciona um mock para a função isAxiosError para que o type guard funcione nos testes
mockedAxios.isAxiosError.mockImplementation(
  (payload: any): payload is AxiosError => {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'isAxiosError' in payload &&
      (payload as { isAxiosError?: unknown }).isAxiosError === true
    );
  },
);

// HTML de exemplo para simular a página de resultados do LinkedIn
const mockHtmlResultPage = `
  <ul class="jobs-search__results-list">
    <li>
      <div class="job-search-card">
        <h3 class="base-search-card__title">Vaga de Teste 1</h3>
        <h4 class="base-search-card__subtitle">Empresa de Teste</h4>
        <span class="job-search-card__location">São Paulo, Brasil</span>
        <a class="base-card__full-link" href="https://linkedin.com/jobs/view/vaga1"></a>
        <time class="job-search-card__listdate">Há 1 dia</time>
      </div>
    </li>
    <li>
      <div class="job-search-card">
        <h3 class="base-search-card__title">Vaga de Teste 2</h3>
        <h4 class="base-search-card__subtitle">Outra Empresa</h4>
        <span class="job-search-card__location">Rio de Janeiro, Brasil</span>
        <a class="base-card__full-link" href="https://linkedin.com/jobs/view/vaga2"></a>
        <time class="job-search-card__listdate--new">Há 2 horas</time>
      </div>
    </li>
  </ul>
`;

// HTML de exemplo para simular a página de detalhes de uma vaga
const mockHtmlDetailPage = `
  <div>
    <div class="description__text">Descrição detalhada da vaga.</div>
    <ul class="description__job-criteria-list">
      <li>
        <h3 class="description__job-criteria-subheader">Nível de experiência</h3>
        <span class="description__job-criteria-text">Pleno-sênior</span>
      </li>
      <li>
        <h3 class="description__job-criteria-subheader">Tipo de emprego</h3>
        <span class="description__job-criteria-text">Tempo integral</span>
      </li>
    </ul>
  </div>
`;

describe('JobsService', () => {
  let service: JobsService;
  let cacheManagerMock: { get: jest.Mock; set: jest.Mock };

  beforeEach(async () => {
    // Cria um mock simples para o gerenciador de cache
    cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  // Limpa os mocks após cada teste
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchJobs', () => {
    const searchParams: SearchJobsDto = {
      keywords: 'nestjs',
      location: 'Brasil',
    };

    it('deve buscar vagas na web quando o cache da busca está vazio', async () => {
      // Simula cache vazio para a busca e para os detalhes
      cacheManagerMock.get.mockResolvedValue(undefined);
      // Simula a resposta do axios para a página de resultados e de detalhes
      mockedAxios.get.mockResolvedValueOnce({ data: mockHtmlResultPage });
      mockedAxios.get.mockResolvedValue({ data: mockHtmlDetailPage });

      const result = await service.searchJobs(searchParams);

      // Verifica se a busca principal foi feita
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
      );
      // Verifica se os detalhes das 2 vagas foram buscados
      expect(mockedAxios.get).toHaveBeenCalledTimes(3); // 1 para a lista + 2 para detalhes
      // Verifica se o resultado da busca foi salvo no cache
      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        expect.stringContaining('search:'),
        expect.any(Array),
        expect.any(Number),
      );
      // Verifica se o resultado contém as vagas encontradas
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Vaga de Teste 1');
      expect(result[0].description).toBeDefined();
    });

    it('deve retornar a lista de vagas do cache se disponível', async () => {
      const mockCachedList = [
        {
          title: 'Vaga em Cache',
          company: 'Empresa Cache',
          location: 'Cachelandia',
          link: 'https://linkedin.com/jobs/view/vagacache',
        },
      ];
      // Simula cache HIT para a busca principal
      cacheManagerMock.get.mockResolvedValueOnce(mockCachedList);
      // Simula a resposta para os detalhes
      mockedAxios.get.mockResolvedValue({ data: mockHtmlDetailPage });

      const result = await service.searchJobs(searchParams);

      // Verifica se a busca principal (lista de vagas) NÃO foi feita
      expect(mockedAxios.get).toHaveBeenCalledTimes(1); // Apenas para os detalhes da vaga em cache
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://linkedin.com/jobs/view/vagacache',
        expect.any(Object),
      );
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Vaga em Cache');
    });

    it('deve lidar com o erro 429 (Too Many Requests) e continuar', async () => {
      // Simula cache vazio
      cacheManagerMock.get.mockResolvedValue(undefined);
      // Simula a resposta da página de resultados
      mockedAxios.get.mockResolvedValueOnce({ data: mockHtmlResultPage });
      // Simula um erro 429 para a primeira vaga e sucesso para a segunda
      mockedAxios.get.mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 429 },
      });
      mockedAxios.get.mockResolvedValueOnce({ data: mockHtmlDetailPage });

      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

      const result = await service.searchJobs(searchParams);

      expect(result).toHaveLength(2);
      // A primeira vaga não terá detalhes por causa do erro
      expect(
        result.find((job) => job.title === 'Vaga de Teste 1')?.description,
      ).toBeUndefined();
      // A segunda vaga terá detalhes
      expect(
        result.find((job) => job.title === 'Vaga de Teste 2')?.description,
      ).toBeDefined();
      // Verifica se o log de aviso foi chamado
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Recebido erro 429'),
      );
    });

    it('deve ordenar os resultados com vagas detalhadas no topo', async () => {
      // Simula cache vazio
      cacheManagerMock.get.mockResolvedValue(undefined);
      // Simula a resposta da página de resultados
      mockedAxios.get.mockResolvedValueOnce({ data: mockHtmlResultPage });
      // Simula um erro para a primeira vaga e sucesso para a segunda
      mockedAxios.get.mockRejectedValueOnce(new Error('Erro genérico'));
      mockedAxios.get.mockResolvedValueOnce({ data: mockHtmlDetailPage });

      const result = await service.searchJobs(searchParams);

      expect(result).toHaveLength(2);
      // A vaga com detalhes (Vaga de Teste 2) deve ser a primeira da lista
      expect(result[0].title).toBe('Vaga de Teste 2');
      expect(result[0].description).toBeDefined();
      // A vaga sem detalhes (Vaga de Teste 1) deve ser a última
      expect(result[1].title).toBe('Vaga de Teste 1');
      expect(result[1].description).toBeUndefined();
    });
  });
});
