"use client"

import { useState, useMemo, useCallback } from "react"
import {
  Search,
  MapPin,
  Filter,
  Clock,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Building2,
  Briefcase,
  Users,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { jobsApi, type Job, type SearchJobsParams } from "@/lib/jobs-api"

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const [contractType, setContractType] = useState("all")
  const [experience, setExperience] = useState("all")
  const [salaryRange, setSalaryRange] = useState("all")
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [expandedDescriptions, setExpandedDescriptions] = useState<string[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setError("Por favor, digite uma palavra-chave para buscar")
      return
    }

    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const params: SearchJobsParams = {
        keywords: searchTerm,
        location: location || "Brasil",
        timeFilter: 86400, // 24 hours
      }

      const results = await jobsApi.searchJobs(params)
      setJobs(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar vagas")
      setJobs([])
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, location])

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesContract =
        contractType === "all" ||
        (contractType === "full-time" && job.jobType?.toLowerCase().includes("integral")) ||
        (contractType === "part-time" && job.jobType?.toLowerCase().includes("meio")) ||
        (contractType === "contract" && job.jobType?.toLowerCase().includes("contrato")) ||
        (contractType === "internship" && job.jobType?.toLowerCase().includes("estágio"))

      const matchesExperience =
        experience === "all" ||
        (experience === "entry" && job.experienceLevel?.toLowerCase().includes("júnior")) ||
        (experience === "associate" && job.experienceLevel?.toLowerCase().includes("pleno")) ||
        (experience === "mid-senior" && job.experienceLevel?.toLowerCase().includes("sênior")) ||
        (experience === "internship" && job.experienceLevel?.toLowerCase().includes("estágio"))

      return matchesContract && matchesExperience
    })
  }, [jobs, contractType, experience])

  const toggleSaveJob = (jobLink: string) => {
    setSavedJobs((prev) => (prev.includes(jobLink) ? prev.filter((link) => link !== jobLink) : [...prev, jobLink]))
  }

  const toggleDescription = (jobLink: string) => {
    setExpandedDescriptions((prev) =>
      prev.includes(jobLink) ? prev.filter((link) => link !== jobLink) : [...prev, jobLink],
    )
  }

  const truncateDescription = (description: string, maxLength = 200) => {
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength) + "..."
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Vagas do LinkedIn</h1>
          <p className="text-muted-foreground">Encontre oportunidades com nossa interface otimizada</p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar cargos ou empresas"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-border"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Localização (opcional)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 border-border"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button className="md:w-auto" onClick={handleSearch} disabled={isLoading || !searchTerm.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                {isLoading ? "Buscando..." : "Buscar"}
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Filtros</h2>
                </div>

                <div className="space-y-6">
                  {/* Contract Type */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Tipo de Contrato</label>
                    <Select value={contractType} onValueChange={setContractType}>
                      <SelectTrigger className="border-border">
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="full-time">Tempo Integral</SelectItem>
                        <SelectItem value="part-time">Meio Período</SelectItem>
                        <SelectItem value="contract">Contrato</SelectItem>
                        <SelectItem value="internship">Estágio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Nível de Experiência</label>
                    <Select value={experience} onValueChange={setExperience}>
                      <SelectTrigger className="border-border">
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="internship">Estágio</SelectItem>
                        <SelectItem value="entry">Júnior</SelectItem>
                        <SelectItem value="associate">Pleno</SelectItem>
                        <SelectItem value="mid-senior">Sênior</SelectItem>
                        <SelectItem value="director">Diretor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => {
                      setContractType("all")
                      setExperience("all")
                      setSalaryRange("all")
                    }}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3">
            {hasSearched && (
              <div className="mb-6 flex items-center justify-between">
                <p className="text-muted-foreground">
                  {isLoading ? "Buscando vagas..." : `${filteredJobs.length} vagas encontradas`}
                </p>
                {filteredJobs.length > 0 && (
                  <Select defaultValue="recent">
                    <SelectTrigger className="w-48 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Mais recentes</SelectItem>
                      <SelectItem value="relevance">Mais relevantes</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Buscando vagas no LinkedIn...</p>
                  <p className="text-sm text-muted-foreground mt-2">Isso pode levar alguns segundos</p>
                </div>
              </div>
            )}

            {!hasSearched && !isLoading && (
              <Card className="shadow-sm">
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Comece sua busca</h3>
                  <p className="text-muted-foreground">Digite uma palavra-chave para encontrar vagas no LinkedIn</p>
                </CardContent>
              </Card>
            )}

            {/* Job Results */}
            {!isLoading && hasSearched && (
              <div className="space-y-4">
                {filteredJobs.map((job, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer border shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <img
                          src={job.companyLogoUrl || "/placeholder.svg?height=48&width=48"}
                          alt={`${job.company} logo`}
                          className="w-12 h-12 rounded object-cover flex-shrink-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=48&width=48"
                          }}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-primary hover:underline transition-colors mb-1">
                                {job.link ? (
                                  <a href={job.link} target="_blank" rel="noopener noreferrer">
                                    {job.title}
                                  </a>
                                ) : (
                                  job.title
                                )}
                              </h3>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-foreground font-medium">{job.company}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSaveJob(job.link || job.title)}
                              className="flex-shrink-0"
                            >
                              {savedJobs.includes(job.link || job.title) ? (
                                <BookmarkCheck className="h-4 w-4 text-primary" />
                              ) : (
                                <Bookmark className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            {job.postedDate && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {job.postedDate}
                              </div>
                            )}
                          </div>

                          {job.description && (
                            <div className="mb-3">
                              <p className="text-sm text-muted-foreground">
                                {expandedDescriptions.includes(job.link || job.title)
                                  ? job.description
                                  : truncateDescription(job.description)}
                              </p>
                              {job.description.length > 200 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleDescription(job.link || job.title)}
                                  className="p-0 h-auto text-primary hover:underline mt-1"
                                >
                                  {expandedDescriptions.includes(job.link || job.title) ? (
                                    <>
                                      <ChevronUp className="h-4 w-4 mr-1" />
                                      Ver menos
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="h-4 w-4 mr-1" />
                                      Ver mais
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.experienceLevel && (
                              <Badge variant="outline" className="text-xs">
                                <Briefcase className="h-3 w-3 mr-1" />
                                {job.experienceLevel}
                              </Badge>
                            )}
                            {job.jobType && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {job.jobType}
                              </Badge>
                            )}
                            {job.role && (
                              <Badge variant="outline" className="text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                {job.role}
                              </Badge>
                            )}
                            {job.sectors && (
                              <Badge variant="outline" className="text-xs">
                                <Building2 className="h-3 w-3 mr-1" />
                                {job.sectors}
                              </Badge>
                            )}
                          </div>

                          {job.status && (
                            <div className="mb-4">
                              <Badge
                                variant={job.status === "Actively Hiring" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {job.status}
                              </Badge>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              {job.link && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={job.link} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Ver no LinkedIn
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && hasSearched && filteredJobs.length === 0 && jobs.length === 0 && (
              <Card className="shadow-sm">
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma vaga encontrada</h3>
                  <p className="text-muted-foreground">
                    Tente usar palavras-chave diferentes ou ajustar sua localização.
                  </p>
                </CardContent>
              </Card>
            )}

            {!isLoading && hasSearched && filteredJobs.length === 0 && jobs.length > 0 && (
              <Card className="shadow-sm">
                <CardContent className="p-12 text-center">
                  <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma vaga corresponde aos filtros</h3>
                  <p className="text-muted-foreground">Tente ajustar seus filtros para ver mais resultados.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
