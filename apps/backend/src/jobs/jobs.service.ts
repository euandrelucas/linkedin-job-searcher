import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchJobsDto } from './dto/search-jobs.dto';

/**
 * @type Jobs
 * @description Define a estrutura de dados para uma vaga de emprego.
 * Contém tanto as informações básicas extraídas da página de resultados
 * quanto os detalhes obtidos da página específica da vaga.
 */
type Jobs = {
  /** @property {string} title - O título da vaga. */
  title: string;
  /** @property {string} company - O nome da empresa que oferece a vaga. */
  company: string;
  /** @property {string} location - A localização da vaga. */
  location: string;
  /** @property {string} link - O link para a página de detalhes da vaga. */
  link?: string;
  /** @property {string} postedDate - A data de publicação da vaga (texto, ex: "Há 1 hora"). */
  postedDate?: string;
  /** @property {string} companyLogoUrl - A URL do logo da empresa. */
  companyLogoUrl?: string;
  /** @property {string} status - Um status sobre a candidatura (ex: "Seja um dos primeiros a se candidatar"). */
  status?: string;
  /** @property {string} description - A descrição completa da vaga. */
  description?: string;
  /** @property {string} experienceLevel - O nível de experiência exigido (ex: "Pleno-sênior"). */
  experienceLevel?: string;
  /** @property {string} jobType - O tipo de contrato (ex: "Tempo integral"). */
  jobType?: string;
  /** @property {string} role - A função ou área de atuação (ex: "Tecnologia da informação"). */
  role?: string;
  /** @property {string} sectors - Os setores de mercado da empresa. */
  sectors?: string;
};

/**
 * @class JobsService
 * @description Serviço responsável por realizar o web scraping de vagas no LinkedIn.
 */
@Injectable()
export class JobsService {
  /**
   * @private
   * @readonly
   * @memberof JobsService
   * @description Instância do Logger do NestJS para registrar informações e erros.
   */
  private readonly logger = new Logger(JobsService.name);

  /**
   * @private
   * @method delay
   * @description Cria uma pausa na execução. Essencial para evitar erros de "Too Many Requests" (429).
   * @param {number} ms - O tempo de espera em milissegundos.
   * @returns {Promise<void>} Uma promessa que resolve após o tempo especificado.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * @public
   * @async
   * @method searchJobs
   * @description Orquestra o processo de busca de vagas. Primeiro, busca a lista de vagas
   * e, em seguida, itera sobre cada uma para obter os detalhes completos.
   * @param {SearchJobsDto} params - DTO contendo palavras-chave, localização e filtro de tempo.
   * @returns {Promise<Jobs[]>} Uma promessa que resolve para um array de objetos `Jobs` com todos os detalhes.
   */
  async searchJobs(params: SearchJobsDto): Promise<Jobs[]> {
    const { keywords, location, timeFilter = 3600 } = params;

    const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(
      keywords,
    )}&location=${encodeURIComponent(location)}&f_TPR=r${timeFilter}`;

    try {
      // 1. Busca a página principal com a lista de vagas
      const { data } = await axios.get<string>(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        },
      });

      const $ = cheerio.load(data);
      const jobsList: Jobs[] = [];

      // 2. Extrai as informações básicas de cada vaga na lista
      $('.jobs-search__results-list > li').each((_, el) => {
        const listItem = $(el);
        const jobCard = listItem.find('.job-search-card');

        if (jobCard.length) {
          const title = jobCard
            .find('h3.base-search-card__title')
            .text()
            .trim();
          const company = jobCard
            .find('h4.base-search-card__subtitle')
            .text()
            .trim();
          const location = jobCard
            .find('.job-search-card__location')
            .text()
            .trim();
          const link = jobCard.find('a.base-card__full-link').attr('href');
          const postedDate = jobCard
            .find('time.job-search-card__listdate--new')
            .text()
            .trim();
          const statusText = jobCard
            .find('.job-posting-benefits__text')
            .text()
            .trim();
          const status = statusText.replace(/\s\s+/g, ' ');
          const companyLogoImg = listItem.find('.search-entity-media img');
          const companyLogoUrl =
            companyLogoImg.attr('src') ||
            companyLogoImg.attr('data-delayed-url');

          if (title && company && link) {
            jobsList.push({
              title,
              company,
              location,
              link,
              postedDate,
              companyLogoUrl,
              status,
            });
          }
        }
      });

      // 3. Itera sobre a lista de vagas para buscar os detalhes de cada uma sequencialmente
      const detailedJobs: Jobs[] = [];
      for (const job of jobsList) {
        try {
          if (job.link) {
            this.logger.log(`Buscando detalhes para a vaga: ${job.title}`);
            const details = await this.getJobDetails(job.link);
            detailedJobs.push({ ...job, ...details });

            // Pausa de 1 segundo entre as requisições para evitar bloqueio (rate limiting)
            await this.delay(1000);
          }
        } catch (error) {
          this.logger.error(
            `Falha ao obter detalhes para a vaga: ${job.title}`,
            (error as Error)?.stack,
          );
          detailedJobs.push(job); // Adiciona o job mesmo sem detalhes em caso de erro
        }
      }

      return detailedJobs;
    } catch (error) {
      this.logger.error(
        'Erro ao buscar a lista de vagas no LinkedIn:',
        (error as Error).stack,
      );
      throw new Error('Não foi possível obter os dados do LinkedIn.');
    }
  }

  /**
   * @private
   * @async
   * @method getJobDetails
   * @description Acessa a página de uma vaga específica para extrair informações detalhadas.
   * @param {string} jobUrl - A URL da página da vaga.
   * @returns {Promise<Partial<Jobs>>} Um objeto com os detalhes extraídos da vaga.
   */
  private async getJobDetails(jobUrl: string): Promise<Partial<Jobs>> {
    const { data } = await axios.get<string>(jobUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      },
    });

    const $ = cheerio.load(data);

    // Extrai a descrição completa e limpa o texto
    const description = $('.description__text')
      .text()
      .trim()
      .replace(/\s\s+/g, '\n');

    let experienceLevel = '';
    let jobType = '';
    let role = '';
    let sectors = '';

    // Itera sobre os "critérios da vaga" para extrair informações estruturadas
    $('.description__job-criteria-list li').each((_, el) => {
      const header = $(el)
        .find('h3.description__job-criteria-subheader')
        .text()
        .trim();
      const value = $(el)
        .find('span.description__job-criteria-text')
        .text()
        .trim();

      switch (header) {
        case 'Nível de experiência':
          experienceLevel = value;
          break;
        case 'Tipo de emprego':
          jobType = value;
          break;
        case 'Função':
          role = value;
          break;
        case 'Setores':
          sectors = value;
          break;
      }
    });

    return { description, experienceLevel, jobType, role, sectors };
  }
}
