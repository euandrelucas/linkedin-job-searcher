import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
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
  /** @property {string} location - A localização da vaga (ex: "São Paulo, Brasil"). */
  location: string;
  /** @property {string} link - O link direto para a página de detalhes da vaga. */
  link?: string;
  /** @property {string} postedDate - A data de publicação da vaga (texto, ex: "Há 1 hora"). */
  postedDate?: string;
  /** @property {string} companyLogoUrl - A URL do logo da empresa. */
  companyLogoUrl?: string;
  /** @property {string} status - Um status sobre a candidatura (ex: "Seja um dos primeiros a se candidatar"). */
  status?: string;
  /** @property {string} description - A descrição completa da vaga, formatada. */
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
 * Este serviço busca uma lista de vagas com base em palavras-chave e localização,
 * extrai os detalhes de cada vaga de forma otimizada (usando cache e processamento
 * em lotes) e retorna uma lista consolidada e ordenada.
 */
@Injectable()
export class JobsService {
  /**
   * @private
   * @readonly
   * @memberof JobsService
   * @description Instância do Logger do NestJS para registrar informações, avisos e erros.
   */
  private readonly logger = new Logger(JobsService.name);

  /**
   * @constructor
   * @param {Cache} cache - Injeta o serviço de cache do NestJS (`cache-manager`).
   * O cache é usado para armazenar os detalhes das vagas e evitar requisições repetidas.
   */
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  /**
   * @private
   * @method delay
   * @description Cria uma pausa na execução. Essencial para adicionar um intervalo
   * entre os lotes de requisições, ajudando a evitar bloqueios por limite de taxa.
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
   * @description Ponto de entrada principal do serviço. Orquestra todo o processo de busca.
   * @param {SearchJobsDto} params - DTO contendo os parâmetros de busca (palavras-chave, localização, etc.).
   * @returns {Promise<Jobs[]>} Uma lista de vagas, com as mais detalhadas no topo.
   * @throws {Error} Lança um erro se a busca inicial no LinkedIn falhar.
   */
  async searchJobs(params: SearchJobsDto): Promise<Jobs[]> {
    const { keywords, location, timeFilter = 3600 } = params;
    const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(
      keywords,
    )}&location=${encodeURIComponent(location)}&f_TPR=r${timeFilter}`;

    try {
      // Etapa 1: Busca a página principal com a lista de vagas.
      this.logger.log(`Buscando lista de vagas em: ${url}`);
      const { data } = await axios.get<string>(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        },
      });

      const $ = cheerio.load(data);
      const jobsList: Jobs[] = [];

      // Etapa 2: Extrai as informações básicas de cada vaga na lista usando seletores CSS.
      $('.jobs-search__results-list > li').each((_, el) => {
        const jobCard = $(el).find('.job-search-card');
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

          // Extrai os dados adicionais que estavam faltando
          const postedDate = jobCard
            .find(
              'time.job-search-card__listdate, time.job-search-card__listdate--new',
            )
            .text()
            .trim();
          const companyLogoImg = $(el).find('.search-entity-media img');
          const companyLogoUrl =
            companyLogoImg.attr('data-delayed-url') ||
            companyLogoImg.attr('src');
          const statusText = jobCard
            .find('.job-posting-benefits__text')
            .text()
            .trim();
          const status = statusText.replace(/\s\s+/g, ' ');

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

      this.logger.log(
        `${jobsList.length} vagas encontradas. Buscando detalhes em lotes...`,
      );

      // Etapa 3: Processa a busca de detalhes em lotes para evitar sobrecarga e erros 429.
      const detailedJobs: Jobs[] = [];
      const batchSize = 5; // Define o número de requisições simultâneas por lote.

      for (let i = 0; i < jobsList.length; i += batchSize) {
        const batch = jobsList.slice(i, i + batchSize);
        this.logger.log(
          `Processando lote ${i / batchSize + 1}/${Math.ceil(jobsList.length / batchSize)}...`,
        );

        const batchPromises = batch
          .filter((job) => typeof job.link === 'string')
          .map((job) =>
            this.getJobDetails(job.link as string)
              .then((details) => ({ ...job, ...details }))
              .catch((error) => {
                this.logger.error(
                  `Falha ao obter detalhes para a vaga: ${job.title}`,
                  (error as Error)?.stack,
                );
                return job;
              }),
          );

        const batchResults = await Promise.all(batchPromises);
        detailedJobs.push(...batchResults);

        if (i + batchSize < jobsList.length) {
          await this.delay(500);
        }
      }

      this.logger.log('Busca de detalhes concluída. Ordenando resultados...');

      // Etapa 4: Ordena a lista para colocar vagas com descrição (detalhes completos) no topo.
      detailedJobs.sort((a, b) => {
        const aHasDetails = a.description ? 1 : 0;
        const bHasDetails = b.description ? 1 : 0;
        return bHasDetails - aHasDetails;
      });

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
   * @description Acessa a página de uma vaga para extrair detalhes, utilizando um sistema de cache.
   * @param {string} jobUrl - A URL da página da vaga.
   * @returns {Promise<Partial<Jobs>>} Um objeto com os detalhes extraídos da vaga.
   */
  private async getJobDetails(jobUrl: string): Promise<Partial<Jobs>> {
    const cachedDetails = await this.cache.get<Partial<Jobs>>(jobUrl);
    if (cachedDetails) {
      this.logger.log(`[CACHE] Retornando detalhes para: ${jobUrl}`);
      return cachedDetails;
    }

    this.logger.log(`[HTTP] Buscando detalhes em: ${jobUrl}`);
    const { data } = await axios.get<string>(jobUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      },
    });

    const $ = cheerio.load(data);

    const description = $('.description__text')
      .text()
      .trim()
      .replace(/\s\s+/g, '\n');
    const details: Partial<Jobs> = { description };

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
          details.experienceLevel = value;
          break;
        case 'Tipo de emprego':
          details.jobType = value;
          break;
        case 'Função':
          details.role = value;
          break;
        case 'Setores':
          details.sectors = value;
          break;
      }
    });

    await this.cache.set(jobUrl, details, 3600 * 1000);

    return details;
  }
}
