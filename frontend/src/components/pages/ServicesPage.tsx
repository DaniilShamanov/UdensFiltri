"use client";

import React, { useState } from 'react';
import { Wrench, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { getServices } from '@/lib/catalog';
import { Service } from '@/lib/types';
import { getErrorCode } from '@/lib/api';
import { toast } from 'sonner';

const ServicesPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const t = useTranslations('services');
  const tErrors = useTranslations('errors');

  React.useEffect(() => {
    (async () => {
      try {
        setServices(await getServices());
      } catch (err) {
        const errorCode = getErrorCode(err);
        let message = 'Failed to load services';
        if (errorCode && tErrors.has(errorCode)) {
          message = tErrors(errorCode);
        }
        toast.error(message);
        setServices([]);
      }
    })();
  }, [tErrors]);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-secondary to-primary rounded-2xl p-8 md:p-12 mb-12 text-white">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Wrench className="h-8 w-8" />
              </div>
              <h1 className="text-2xl leading-tight font-bold break-words sm:text-3xl md:text-4xl">{t('hero.title')}</h1>
            </div>
            <p className="text-lg text-white/90 mb-6">
              {t('hero.description')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-secondary hover:bg-white/90"
                onClick={() => router.push('/contact')}
              >
                {t('hero.scheduleButton')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                {t('hero.quoteButton')}
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-2xl">{t('table.title')}</CardTitle>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('table.searchPlaceholder')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="md:hidden space-y-4">
              {filteredServices.map((service) => (
                <Card key={service.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold leading-tight">{service.name}</h3>
                      <Badge className="bg-primary leading-none self-start">€{service.price.toFixed(2)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                    <Button size="sm" className="w-full bg-accent hover:bg-accent/90" onClick={() => router.push('/contact')}>
                      {t('table.bookButton')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold">{t('table.serviceName')}</TableHead>
                    <TableHead className="font-semibold">{t('table.description')}</TableHead>
                    <TableHead className="font-semibold text-right">{t('table.price')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="text-muted-foreground max-w-md">
                        {service.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-primary">€{service.price.toFixed(2)}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                {t('table.empty')}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold mb-2">{t('info.sameDay.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('info.sameDay.description')}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="font-semibold mb-2">{t('info.certified.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('info.certified.description')}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">🛡️</div>
              <h3 className="font-semibold mb-2">{t('info.guarantee.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('info.guarantee.description')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;