import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 bg-muted rounded-lg flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-muted-foreground">404</span>
          </div>
          <CardTitle className="text-2xl">Pagina non trovata</CardTitle>
          <CardDescription>
            La pagina che stai cercando non esiste o è stata spostata.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Torna alla Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna Indietro
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
