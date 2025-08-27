import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { SearchJobsDto } from './dto/search-jobs.dto';

// Criando um mock para o JobsService
const mockJobsService: Partial<JobsService> = {
  searchJobs: jest.fn<
    Promise<
      { title: string; company: string; location: string; link: string }[]
    >,
    [SearchJobsDto]
  >(),
};

describe('JobsController', () => {
  let controller: JobsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        {
          provide: JobsService,
          useValue: mockJobsService,
        },
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
  });
  // Limpa os mocks após cada teste
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('deve chamar o jobsService.searchJobs com os parâmetros corretos', async () => {
      // Dados de entrada para o teste
      const query: SearchJobsDto = {
        keywords: 'developer',
        location: 'Brazil',
        timeFilter: 86400,
      };

      // Dados de retorno esperados do serviço (mock)
      const expectedResult = [
        {
          title: 'Vaga de Desenvolvedor',
          company: 'Empresa de Tecnologia',
          location: 'Brazil',
          link: 'http://linkedin.com/job/123',
        },
      ];

      // Configura o mock do serviço para retornar os dados esperados
      (mockJobsService.searchJobs as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      // Chama o método do controller
      const result = await controller.search(query);

      // Verifica se o método do serviço foi chamado com os parâmetros corretos
      expect(mockJobsService.searchJobs as jest.Mock).toHaveBeenCalledWith(
        query,
      );

      // Verifica se o controller retornou o resultado esperado do serviço
      expect(result).toEqual(expectedResult);
    });

    it('deve repassar erros do jobsService', async () => {
      // Dados de entrada para o teste
      const query: SearchJobsDto = {
        keywords: 'error',
        location: 'anywhere',
      };

      // Configura o mock para simular um erro
      const errorMessage = 'Erro ao buscar dados';
      (mockJobsService.searchJobs as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      // Verifica se o controller lança a exceção recebida do serviço
      await expect(controller.search(query)).rejects.toThrow(Error);
      await expect(controller.search(query)).rejects.toThrow(errorMessage);
    });
  });
});
