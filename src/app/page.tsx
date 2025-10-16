/**
 * @fileoverview Marketing homepage for Bagizi-ID SPPG Management Platform
 * @version Next.js 15.5.4 / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

import Link from 'next/link'
import { PublicHeader } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Users, 
  ChefHat, 
  Truck, 
  BarChart3, 
  Shield, 
  Clock,
  CheckCircle
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="flex-1 container max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              🚀 Platform Enterprise untuk SPPG
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-foreground">
              Kelola SPPG Anda dengan{' '}
              <span className="text-primary">
                Bagizi-ID
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Platform manajemen SPPG enterprise yang membantu Anda mengelola menu, procurement, 
              produksi, dan distribusi program gizi dengan mudah dan efisien.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/demo-request">
                Coba Demo Gratis
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/login">
                <Shield className="mr-2 h-5 w-5" />
                Masuk ke Platform
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <Badge variant="outline">Platform Features</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Fitur Lengkap untuk SPPG Modern
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk menjalankan SPPG yang efisien dan berkualitas tinggi.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Menu Management */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ChefHat className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Menu Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Kelola menu harian dengan perhitungan gizi otomatis, perencanaan biaya, 
                  dan variasi menu yang sesuai standar SPPG.
                </CardDescription>
              </CardContent>
            </Card>
            
            {/* Procurement */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Procurement</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Sistem procurement terintegrasi dengan supplier management, 
                  tracking harga, dan analisis cost optimization.
                </CardDescription>
              </CardContent>
            </Card>
            
            {/* Distribution */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Distribution</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Kelola distribusi makanan dengan tracking real-time, 
                  jadwal pengiriman, dan monitoring kualitas makanan.
                </CardDescription>
              </CardContent>
            </Card>
            
            {/* Analytics */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Analytics & Reporting</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Dashboard analitik lengkap dengan laporan gizi, finansial, 
                  dan performance metrics untuk pengambilan keputusan.
                </CardDescription>
              </CardContent>
            </Card>
            
            {/* Multi-tenant */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Multi-tenant SaaS</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Arsitektur multi-tenant yang aman dengan isolasi data, 
                  role management, dan skalabilitas enterprise.
                </CardDescription>
              </CardContent>
            </Card>
            
            {/* Security */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Enterprise Security</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Keamanan tingkat enterprise dengan audit trail, 
                  role-based access control, dan enkripsi data.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container max-w-4xl mx-auto px-4 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Siap Modernisasi SPPG Anda?
            </h2>
            <p className="text-lg text-muted-foreground">
              Bergabunglah dengan SPPG lainnya yang sudah merasakan efisiensi 
              dan transparansi dengan Bagizi-ID.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/demo-request">
                <Clock className="mr-2 h-5 w-5" />
                Request Demo
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/features">
                <CheckCircle className="mr-2 h-5 w-5" />
                Lihat Fitur Lengkap
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Bagizi-ID</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2024 Bagizi-ID. Platform SPPG Management Enterprise.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
