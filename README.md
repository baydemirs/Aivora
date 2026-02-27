PRD – Aivora Sistem Geliştirme Dokümanı
1. Ürün Tanımı
Aivora; kurumsal firmalar için yapay zeka destekli müşteri iletişimi, bilgi tabanı yönetimi ve görev otomasyonu sağlayan bir platformdur. Bu doküman, mevcut sistemin ölçeklenebilir, modüler ve enterprise seviyeye taşınması için gerekli fonksiyonel ve teknik gereksinimleri tanımlar.

2. Ürün Vizyonu
[ ] Yapay zekayı operasyonel yük azaltan bir "destek asistanı" olmaktan çıkarıp, süreç yöneten otonom bir sistem haline getirmek [ ] Kurumların bilgi tabanını dinamik olarak öğrenen ve güncelleyen bir yapı kurmak [ ] Çok kanallı (Web, WhatsApp, API) entegre müşteri iletişim altyapısı oluşturmak

3. Hedef Kullanıcı Segmentleri
[ ] KOBİ'ler [ ] E-ticaret firmaları [ ] Teknik servis firmaları [ ] Eğitim kurumları [ ] Kurumsal satış ekipleri

4. Fonksiyonel Gereksinimler
4.1 AI Chat & RAG Sistemi
[ ] Gelişmiş RAG (Retrieval-Augmented Generation) altyapısı [ ] Vektör veritabanı entegrasyonu (örn: Qdrant / Weaviate) [ ] Soru cevap geçmişine göre dinamik öğrenme [ ] Belirsiz sorular için otomatik görev oluşturma [ ] İnsan onaylı cevap mekanizması (Human-in-the-loop) [ ] Cevap güven skoru hesaplama [ ] Yanıt versiyonlama ve geri alma sistemi

4.2 Görev Yönetim Sistemi
[ ] AI tarafından oluşturulan görevlerin panelde listelenmesi [ ] Görev önceliklendirme algoritması [ ] SLA takibi [ ] Departman bazlı yönlendirme [ ] Görev performans analitiği

4.3 Bilgi Tabanı Yönetimi
[ ] Otomatik doküman indexleme [ ] PDF, DOCX, XLSX veri içeriği çıkarımı [ ] Versiyon kontrol sistemi [ ] Bilgi çakışma tespiti [ ] Eski içerik arşivleme mekanizması

4.4 Çok Kanallı Entegrasyon
[ ] Web widget chatbot [ ] WhatsApp Business API entegrasyonu [ ] REST API [ ] n8n webhook entegrasyonu [ ] CRM sistemleri ile entegrasyon

4.5 Yönetim Paneli
[ ] Rol bazlı yetkilendirme (RBAC) [ ] Çoklu firma (multi-tenant) desteği [ ] AI cevap düzenleme ekranı [ ] Cevap analitik dashboard'u [ ] Prompt yönetim ekranı [ ] Model değiştirme desteği (OpenAI / Local LLM)

5. İleri Seviye (Öngörülen) Özellikler
5.1 Otonom Süreç Motoru
[ ] AI'nın belirli kurallara göre otomatik aksiyon alması [ ] Ödeme gecikmesi algılayıp otomatik hatırlatma oluşturma [ ] Satış fırsatı tespiti

5.2 Akıllı Analitik
[ ] Müşteri duygu analizi [ ] Konu kümelendirme [ ] En sık gelen problem haritası [ ] Churn tahmini

5.3 AI Güvenlik Katmanı
[ ] Prompt injection tespiti [ ] Veri sızıntısı önleme katmanı [ ] Hassas veri maskeleme [ ] Kullanıcı bazlı erişim filtreleme

5.4 AI Eğitim Modülü
[ ] İnsanların AI’ya örnek cevap öğretmesi [ ] Öğretilen cevapların otomatik test edilmesi [ ] Model performans karşılaştırması

5.5 Otomatik A/B Test Mekanizması
[ ] İki farklı cevap varyantını test etme [ ] Dönüşüm oranı ölçümü

6. Teknik Gereksinimler
6.1 Backend
[ ] Node.js (NestJS) veya FastAPI [ ] PostgreSQL [ ] Redis (cache + queue) [ ] Vektör DB (Qdrant) [ ] Docker containerization [ ] Kubernetes deploy altyapısı

6.2 Frontend
[ ] React + TypeScript [ ] ShadCN UI veya Tailwind UI [ ] WebSocket gerçek zamanlı veri

6.3 DevOps
[ ] CI/CD (GitHub Actions) [ ] Logging (ELK stack) [ ] Monitoring (Prometheus + Grafana) [ ] Error tracking (Sentry)

7. Açık Kaynak Referans Repositories
RAG & AI
[ ] https://github.com/langchain-ai/langchain [ ] https://github.com/run-llama/llama_index [ ] https://github.com/qdrant/qdrant [ ] https://github.com/deepset-ai/haystack

Multi-Tenant & Auth
[ ] https://github.com/ory/kratos [ ] https://github.com/supabase/supabase

Dashboard & Admin
[ ] https://github.com/appsmithorg/appsmith [ ] https://github.com/refinedev/refine

Workflow & Automation
[ ] https://github.com/n8n-io/n8n [ ] https://github.com/temporalio/temporal

Observability
[ ] https://github.com/getsentry/sentry [ ] https://github.com/prometheus/prometheus [ ] https://github.com/grafana/grafana

8. Ölçeklenebilirlik Stratejisi
[ ] Microservice mimariye geçiş [ ] Tenant bazlı veri izolasyonu [ ] Model cache katmanı [ ] AI cevap maliyet optimizasyon algoritması

9. KPI'lar
[ ] AI çözüm oranı (% kaç soruyu insan müdahalesi olmadan çözüyor) [ ] Ortalama cevap süresi [ ] SLA uyum oranı [ ] Müşteri memnuniyet skoru [ ] Görev kapanma süresi

10. Yol Haritası (Önerilen)
Faz 1: [ ] Temel RAG altyapısı [ ] Görev oluşturma sistemi [ ] Admin panel

Faz 2: [ ] Çok kanallı entegrasyon [ ] Analitik dashboard [ ] AI güvenlik katmanı

Faz 3: [ ] Otonom süreç motoru [ ] A/B test [ ] Model karşılaştırma altyapısı

Bu doküman; teknik ekip, ürün ekibi ve yatırımcı sunumu için referans alınabilecek kapsamlı bir ürün gereksinim taslağıdır.