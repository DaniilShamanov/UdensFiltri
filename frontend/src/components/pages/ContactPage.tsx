"use client";

import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

const ContactPage: React.FC = () => {
  const t = useTranslations('contact');

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{t('phone.title')}</h3>
              <p className="text-muted-foreground mb-1">+371 1234 5678</p>
              <p className="text-sm text-muted-foreground">{t('phone.hours')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{t('email.title')}</h3>
              <p className="text-muted-foreground mb-1 text-sm break-all">info@waterfilters.lv</p>
              <p className="text-muted-foreground text-sm break-all">support@waterfilters.lv</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{t('address.title')}</h3>
              <p className="text-muted-foreground text-sm">
                123 Water Street<br />
                Riga, LV-1050<br />
                Latvia
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{t('hours.title')}</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span>{t('hours.monFri')}</span>
                  <span>{t('hours.monFriTime')}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span>{t('hours.saturday')}</span>
                  <span>{t('hours.saturdayTime')}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span>{t('hours.sunday')}</span>
                  <span>{t('hours.sundayTime')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;