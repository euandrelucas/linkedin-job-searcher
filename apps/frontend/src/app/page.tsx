import Link from "next/link"
import { Search, Filter, Users, Zap, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Encontre vagas do <span className="text-primary">LinkedIn</span> de forma mais eficiente
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Ferramenta auxiliar para busca de empregos no LinkedIn com filtros avançados e interface otimizada. Encontre
            oportunidades de forma mais rápida e organizada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/jobs">
                Buscar Vagas
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Como nossa ferramenta funciona</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Desenvolvemos uma interface otimizada para facilitar sua busca por vagas no LinkedIn
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Interface Otimizada</h3>
                <p className="text-muted-foreground">
                  Interface limpa e focada que facilita a visualização e comparação de vagas do LinkedIn.
                </p>
              </CardContent>
            </Card>

            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Filtros Avançados</h3>
                <p className="text-muted-foreground">
                  Organize e filtre vagas por critérios específicos para encontrar exatamente o que procura.
                </p>
              </CardContent>
            </Card>

            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Acesso Direto</h3>
                <p className="text-muted-foreground">
                  Links diretos para as vagas originais no LinkedIn, mantendo toda a funcionalidade da plataforma.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Por que usar nossa ferramenta?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Criamos uma experiência mais eficiente para navegar pelas oportunidades do LinkedIn.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Design Familiar</h3>
                    <p className="text-muted-foreground">
                      Interface inspirada no LinkedIn com melhorias na usabilidade e organização
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Totalmente Responsivo</h3>
                    <p className="text-muted-foreground">
                      Funciona perfeitamente em desktop, tablet e dispositivos móveis
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Filtros Personalizados</h3>
                    <p className="text-muted-foreground">
                      Mais opções de filtro e organização para encontrar exatamente o que você procura
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 h-96 flex items-center justify-center">
                <Users className="h-32 w-32 text-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Pronto para otimizar sua busca por vagas?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Experimente nossa ferramenta e descubra uma forma mais eficiente de navegar pelas oportunidades do LinkedIn.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8">
            <Link href="/jobs">
              Começar Busca
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
                <span className="text-sm font-bold text-primary-foreground">in</span>
              </div>
              <span className="text-xl font-bold text-foreground">LinkedIn Searcher Helper</span>
            </div>
            <p className="text-muted-foreground text-center md:text-right">
              © 2025 LinkedIn Searcher Helper. Ferramenta auxiliar para busca de empregos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
