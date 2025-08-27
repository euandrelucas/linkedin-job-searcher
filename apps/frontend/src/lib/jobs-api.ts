export interface SearchJobsParams {
  keywords: string
  location: string
  timeFilter?: number // in seconds, default 3600 (1 hour)
}

export interface Job {
  title: string
  company: string
  location: string
  link?: string
  postedDate?: string
  companyLogoUrl?: string
  status?: string
  description?: string
  experienceLevel?: string
  jobType?: string
  role?: string
  sectors?: string
}

export class JobsApiService {
  private baseUrl: string

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "https://linkedin-api.andrepaiva.dev") {
    this.baseUrl = baseUrl
  }

  async searchJobs(params: SearchJobsParams): Promise<Job[]> {
    try {
      const queryParams = new URLSearchParams({
        keywords: params.keywords,
        location: params.location,
        timeFilter: (params.timeFilter || 3600).toString(),
      })

      const response = await fetch(`${this.baseUrl}/jobs/search?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const jobs: Job[] = await response.json()
      return jobs
    } catch (error) {
      console.error("Error fetching jobs:", error)
      throw new Error("Falha ao buscar vagas. Tente novamente.")
    }
  }
}

export const jobsApi = new JobsApiService()
