export type Lang = 'en' | 'tr' | 'fr' | 'it' | 'es';

export const LANGUAGES: { id: Lang; label: string; flag: string }[] = [
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'it', label: 'Italiano', flag: '🇮🇹' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
];

type Strings = {
  appTitle: string;
  urlPlaceholder: string;
  pasteTooltip: string;
  downloadBtn: string;
  fetchingTitle: string;
  queueEmpty: string;
  clearFinished: string;
  statusQueued: string;
  statusDownloading: string;
  statusDone: string;
  statusError: string;
  statusCancelled: string;
  statusPaused: string;
  pause: string;
  resume: string;
  openFile: string;
  cookiesBtn: string;
  settingsBtn: string;
  authTitle: string;
  authDesc: string;
  noCookies: string;
  notFound: string;
  authDone: string;
  settingsTitle: string;
  downloadFolder: string;
  browse: string;
  ytdlpEngine: string;
  updateYtdlp: string;
  updating: string;
  language: string;
  donate: string;
  close: string;
  formatBest: string;
  format1080: string;
  format720: string;
  format480: string;
  formatMp3: string;
  formatM4a: string;
  items: (n: number) => string;
};

const en: Strings = {
  appTitle: 'MyDownloader',
  urlPlaceholder: 'Paste a URL to download…',
  pasteTooltip: 'Paste from clipboard',
  downloadBtn: 'Download',
  fetchingTitle: 'Fetching…',
  queueEmpty: 'No downloads yet. Paste a URL above to get started.',
  clearFinished: 'Clear finished',
  statusQueued: 'Queued',
  statusDownloading: 'Downloading',
  statusDone: 'Done',
  statusError: 'Error',
  statusCancelled: 'Cancelled',
  statusPaused: 'Paused',
  pause: 'Pause',
  resume: 'Resume',
  openFile: 'Open file',
  cookiesBtn: '🍪 Cookies',
  settingsBtn: '⚙ Settings',
  authTitle: 'Cookie Authentication',
  authDesc: 'Use browser cookies to access members-only content.',
  noCookies: 'No cookies',
  notFound: '(not found)',
  authDone: 'Done',
  settingsTitle: 'Settings',
  downloadFolder: 'Download Folder',
  browse: 'Browse',
  ytdlpEngine: 'yt-dlp Engine',
  updateYtdlp: 'Update yt-dlp',
  updating: 'Updating…',
  language: 'Language',
  donate: '❤️ Donate',
  close: 'Close',
  formatBest: 'Best Quality',
  format1080: 'MP4 1080p',
  format720: 'MP4 720p',
  format480: 'MP4 480p',
  formatMp3: 'Audio MP3',
  formatM4a: 'Audio M4A',
  items: (n) => `${n} item${n !== 1 ? 's' : ''}`,
};

const tr: Strings = {
  appTitle: 'MyDownloader',
  urlPlaceholder: 'İndirmek için URL yapıştırın…',
  pasteTooltip: 'Panodan yapıştır',
  downloadBtn: 'İndir',
  fetchingTitle: 'Alınıyor…',
  queueEmpty: 'Henüz indirme yok. Başlamak için yukarıya URL yapıştırın.',
  clearFinished: 'Bitenleri temizle',
  statusQueued: 'Sırada',
  statusDownloading: 'İndiriliyor',
  statusDone: 'Tamamlandı',
  statusError: 'Hata',
  statusCancelled: 'İptal Edildi',
  statusPaused: 'Duraklatıldı',
  pause: 'Duraklat',
  resume: 'Devam Et',
  openFile: 'Dosyayı aç',
  cookiesBtn: '🍪 Çerezler',
  settingsBtn: '⚙ Ayarlar',
  authTitle: 'Çerez Kimlik Doğrulama',
  authDesc: 'Üyelere özel içeriğe erişmek için tarayıcı çerezlerini kullanın.',
  noCookies: 'Çerez yok',
  notFound: '(bulunamadı)',
  authDone: 'Tamam',
  settingsTitle: 'Ayarlar',
  downloadFolder: 'İndirme Klasörü',
  browse: 'Gözat',
  ytdlpEngine: 'yt-dlp Motoru',
  updateYtdlp: 'yt-dlp\'yi Güncelle',
  updating: 'Güncelleniyor…',
  language: 'Dil',
  donate: '❤️ Bağış Yap',
  close: 'Kapat',
  formatBest: 'En İyi Kalite',
  format1080: 'MP4 1080p',
  format720: 'MP4 720p',
  format480: 'MP4 480p',
  formatMp3: 'Ses MP3',
  formatM4a: 'Ses M4A',
  items: (n) => `${n} öğe`,
};

const fr: Strings = {
  appTitle: 'MyDownloader',
  urlPlaceholder: 'Collez une URL à télécharger…',
  pasteTooltip: 'Coller depuis le presse-papier',
  downloadBtn: 'Télécharger',
  fetchingTitle: 'Récupération…',
  queueEmpty: 'Aucun téléchargement. Collez une URL ci-dessus pour commencer.',
  clearFinished: 'Effacer terminés',
  statusQueued: 'En attente',
  statusDownloading: 'Téléchargement',
  statusDone: 'Terminé',
  statusError: 'Erreur',
  statusCancelled: 'Annulé',
  statusPaused: 'En pause',
  pause: 'Pause',
  resume: 'Reprendre',
  openFile: 'Ouvrir le fichier',
  cookiesBtn: '🍪 Cookies',
  settingsBtn: '⚙ Paramètres',
  authTitle: 'Authentification par cookie',
  authDesc: 'Utilisez les cookies du navigateur pour accéder au contenu réservé.',
  noCookies: 'Sans cookies',
  notFound: '(introuvable)',
  authDone: 'OK',
  settingsTitle: 'Paramètres',
  downloadFolder: 'Dossier de téléchargement',
  browse: 'Parcourir',
  ytdlpEngine: 'Moteur yt-dlp',
  updateYtdlp: 'Mettre à jour yt-dlp',
  updating: 'Mise à jour…',
  language: 'Langue',
  donate: '❤️ Faire un don',
  close: 'Fermer',
  formatBest: 'Meilleure qualité',
  format1080: 'MP4 1080p',
  format720: 'MP4 720p',
  format480: 'MP4 480p',
  formatMp3: 'Audio MP3',
  formatM4a: 'Audio M4A',
  items: (n) => `${n} élément${n !== 1 ? 's' : ''}`,
};

const it: Strings = {
  appTitle: 'MyDownloader',
  urlPlaceholder: 'Incolla un URL da scaricare…',
  pasteTooltip: 'Incolla dagli appunti',
  downloadBtn: 'Scarica',
  fetchingTitle: 'Recupero…',
  queueEmpty: 'Nessun download. Incolla un URL sopra per iniziare.',
  clearFinished: 'Elimina completati',
  statusQueued: 'In coda',
  statusDownloading: 'Scaricamento',
  statusDone: 'Completato',
  statusError: 'Errore',
  statusCancelled: 'Annullato',
  statusPaused: 'In pausa',
  pause: 'Pausa',
  resume: 'Riprendi',
  openFile: 'Apri file',
  cookiesBtn: '🍪 Cookie',
  settingsBtn: '⚙ Impostazioni',
  authTitle: 'Autenticazione cookie',
  authDesc: 'Usa i cookie del browser per accedere ai contenuti riservati.',
  noCookies: 'Senza cookie',
  notFound: '(non trovato)',
  authDone: 'OK',
  settingsTitle: 'Impostazioni',
  downloadFolder: 'Cartella download',
  browse: 'Sfoglia',
  ytdlpEngine: 'Motore yt-dlp',
  updateYtdlp: 'Aggiorna yt-dlp',
  updating: 'Aggiornamento…',
  language: 'Lingua',
  donate: '❤️ Dona',
  close: 'Chiudi',
  formatBest: 'Migliore qualità',
  format1080: 'MP4 1080p',
  format720: 'MP4 720p',
  format480: 'MP4 480p',
  formatMp3: 'Audio MP3',
  formatM4a: 'Audio M4A',
  items: (n) => `${n} elemento${n !== 1 ? 'i' : ''}`,
};

const es: Strings = {
  appTitle: 'MyDownloader',
  urlPlaceholder: 'Pega una URL para descargar…',
  pasteTooltip: 'Pegar desde portapapeles',
  downloadBtn: 'Descargar',
  fetchingTitle: 'Obteniendo…',
  queueEmpty: 'Sin descargas. Pega una URL arriba para empezar.',
  clearFinished: 'Limpiar terminados',
  statusQueued: 'En cola',
  statusDownloading: 'Descargando',
  statusDone: 'Completado',
  statusError: 'Error',
  statusCancelled: 'Cancelado',
  statusPaused: 'En pausa',
  pause: 'Pausar',
  resume: 'Reanudar',
  openFile: 'Abrir archivo',
  cookiesBtn: '🍪 Cookies',
  settingsBtn: '⚙ Ajustes',
  authTitle: 'Autenticación de cookies',
  authDesc: 'Usa cookies del navegador para acceder a contenido exclusivo.',
  noCookies: 'Sin cookies',
  notFound: '(no encontrado)',
  authDone: 'Listo',
  settingsTitle: 'Ajustes',
  downloadFolder: 'Carpeta de descarga',
  browse: 'Explorar',
  ytdlpEngine: 'Motor yt-dlp',
  updateYtdlp: 'Actualizar yt-dlp',
  updating: 'Actualizando…',
  language: 'Idioma',
  donate: '❤️ Donar',
  close: 'Cerrar',
  formatBest: 'Mejor calidad',
  format1080: 'MP4 1080p',
  format720: 'MP4 720p',
  format480: 'MP4 480p',
  formatMp3: 'Audio MP3',
  formatM4a: 'Audio M4A',
  items: (n) => `${n} elemento${n !== 1 ? 's' : ''}`,
};

export const translations: Record<Lang, Strings> = { en, tr, fr, it, es };
