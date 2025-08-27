export class SearchJobsDto {
  keywords: string; // ex: "Node.js"
  location: string; // ex: "Natal, RN"
  timeFilter?: number; // ex: 3600 (última hora)
  jobType?: string; // ex: "CLT", "PJ", "Estágio"
  experienceLevel?: string; // ex: "Junior", "Pleno", "Sênior"
}
