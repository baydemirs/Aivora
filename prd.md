PRD – Aivora Sistem Geliştirme Dokumanı

Ürün Tanımı Aivora; kurumsal firmalar için yapay zeka destekli müşteri iletişimi, bilgi tabanı yönetimi ve görev otomasyonu sağlayan bir platformdur. Bu doküman, mevcut sistemin ölçeklenebilir, modüler ve işletmenin seviyeye getirilmesi için gerekli fonksiyonel ve teknik sistemlerdedir.

Ürün Vizyonu [ ] Yapay zeka verisi yükü azaltan bir "destek erişimi" yapılabilir, süreç yönetimini otonom bir sistem haline getirmek [ ] Kurumların bilgi tabanını dinamik olarak öğrenen ve güncelleyen bir yapı oluşturmak [ ] Çok kanallı (Web, WhatsApp, API) entegre müşteri iletişimini oluşturmak

Hedef Kullanıcı Segmentleri [ ] KOBİ'ler [ ] E-ticaret firmaları [ ] Teknik servis firmaları [ ] Eğitim kurumları [ ] Kurumsal satış programları

Fonksiyonel Gereksinimler 4.1 AI Chat & RAG Sistemi [x] Gelişmiş RAG (Retrieval-Augmented Generation) olarak sunulur [x] Vektör veri tabanı verileri (örn: Qdrant / Weaviate) [ ] Soru cevap geçmişine göre dinamik öğrenme [x] Belirsiz sorular için görev oluşturma [ ] İnsan verilerinin cevap oranı (Human-in-the-loop) [x] Cevap güven skoru tablosu [ ] Yanıt süresi ve geri alma sistemi

4.2 Görev Yönetim Sistemi [x] AI tarafından sunulan hizmetlerin panelde listelenmesi [ ] Görev parlaklıklandırma programları [ ] SLA takibi [ ] Departman merkezli yönlendirme [ ] Görev performansı analitiği

4.3 Bilgi Tabanı Yönetimi [x] Otomatik doküman indeksleme [x] PDF, DOCX, XLSX veri içeriği çıkarımı [ ] Versiyon kontrolü [ ] Bilgi çakışmalarının meydana gelmesi [ ] Eski içerik arşivleme oranları

4.4 Çok Kanallı Entegrasyon [ ] Web widget'ı chatbot [ ] WhatsApp Business API Özeti [ ] REST API [ ] n8n webhook Bağlantısı [ ] CRM sistemleri ile entegrasyon

4.5 Yönetim Paneli [x] Rol tabanlı yetkilendirme (RBAC) [x] Çoklu firma (çok kiracılı) desteği [ ] AI cevap düzenleme ekranı [ ] Cevap analitik Dashboard'u [ ] İstem yönetim ekranı [ ] Model değiştirme desteği (OpenAI / Local LLM)

İleri Seviye (Öngörülen) Özellikler 5.1 Otonom Süreç Motoru [ ] AI'nın belirli kurallara göre otomatik aksiyon alımı [ ] Ödeme gecikmesi algılama ve otomatik hatırlatma oluşturma [ ] Satış fırsatı belirleme
5.2 Akıllı Analitik [ ] Müşteri duygu analizi [ ] Konuyu kümelendirme [ ] En sık gelen problem haritası [ ] Churn tahmini

5.3 AI Güvenlik Katmanı [ ] Hızlı enjeksiyon ayrıntıları [ ] Veri sızıntısı önleme gizliliği [ ] Hassas veri maskeleme [x] Kullanıcı tabanlı erişim depolama

5.4 AI Eğitim Modülü [ ] insanlara AI'ya örnek cevap eğitimi [ ] Öğretilen cevapların otomatik test edilmesi [ ] Model performans karşılaştırması

5.5 Otomatik A/B Test Mekanizması [ ] İki farklı cevap özelliklerini test etme [ ] Dönüşüm oranı görünümü

Teknik Gereksinimler 6.1 Backend [x] Node.js (NestJS) veya FastAPI [x] PostgreSQL [ ] Redis (önbellek + kuyruk) [x] Vektör DB (Qdrant) [ ] Docker konteynerizasyonu [ ] Kubernetes dağıtımları
6.2 Ön Uç [ ] React + TypeScript [ ] ShadCN UI veya Tailwind UI [ ] WebSocket gerçek zamanlı veri

6.3 DevOps [ ] CI/CD (GitHub Actions) [ ] Günlük Kaydı (ELK yığını) [ ] İzleme (Prometheus + Grafana) [ ] Hata Takibi (Sentry)

Açık Kaynak Referans Depoları RAG & AI [ ] https://github.com/langchain-ai/langchain [ ] https://github.com/run-llama/llama_index [ ] https://github.com/qdrant/qdrant [ ] https://github.com/deepset-ai/haystack
Çoklu Kiracı ve Kimlik Doğrulama [ ] https://github.com/ory/kratos [ ] https://github.com/supabase/supabase

Kontrol Paneli ve Yönetici [ ] https://github.com/appsmithorg/appsmith [ ] https://github.com/refinedev/refine

İş Akışı ve Otomasyon [ ] https://github.com/n8n-io/n8n [ ] https://github.com/temporalio/temporal

Gözlemlenebilirlik [ ] https://github.com/getsentry/sentry [ ] https://github.com/prometheus/prometheus [ ] https://github.com/grafana/grafana

Ölçeklenebilirlik Stratejisi [ ] Mikro hizmet mimariye geçiş [ ] Kiracı temelli veri izolasyonu [ ] Model önbellek koruması [ ] AI cevap maliyet yenilemesi

KPI'lar [ ] AI çözüm oranı (% kaç soruyu insan müdahalesi olmadan çözüyor) [ ] sıcaklık cevap süresi [ ] SLA uyum oranı [ ] Müşteri özellikleri skoru [ ] İşlem kapanma süresi

Yol Haritası (Önerilen) Faz 1: [x] Temel RAG'de [x] Görev oluşturma sistemi [ ] Yönetici paneli

Faz 2: [ ] Çok kanallı entegrasyon [ ] Analitik kontrol paneli [ ] AI güvenlik güvenliği

Faz 3: [ ] Otonom süreç motoru [ ] A/B testi [ ] Modelin eşleştirilmesi

Bu belge; teknik ekip, ürün ekibi ve tüccar sunumu için referans alınabilecek kapsamlı bir ürün yoğunluğu taslağıdır.