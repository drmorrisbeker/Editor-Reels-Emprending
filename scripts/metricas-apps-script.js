// ============================================================
// Métricas Dr. Beker — Google Apps Script
// Pegar en: Extensions > Apps Script (dentro del Sheet)
//
// ANTES de usar, guardar el token en Script Properties:
//   1. Extensions > Apps Script
//   2. Engranaje (Project Settings) > Script Properties
//   3. Add property: APIFY_TOKEN = apify_api_...tu_token...
// ============================================================

const CONFIG = {
  get APIFY_TOKEN() {
    return PropertiesService.getScriptProperties().getProperty('APIFY_TOKEN') || '';
  },
  TASKS: {
    tiktok:    'YaCemu7b9jlpDpU7k',
    instagram: 'duXACepTTnCohH9gc',
    youtube:   'HvZpRM1DUqMeGyIra',
  },
  SHEET_NAME: 'Posts',
  HEADERS: [
    'post_id', 'platform', 'url', 'posted_at', 'caption',
    'duration_sec', 'views', 'likes', 'comments', 'shares', 'saves',
    'transcript',
    'engagement_rate', 'save_rate', 'share_rate', 'comment_rate',
    'hashtags', 'is_pinned', 'scraped_at'
  ]
};

// ── Entrada principal ──────────────────────────────────────

function syncAll() {
  const token = CONFIG.APIFY_TOKEN;
  if (!token) {
    SpreadsheetApp.getUi().alert('❌ Token Apify no configurado.\nIr a Extensions > Apps Script > Project Settings > Script Properties\nAgregar: APIFY_TOKEN = tu_token');
    return;
  }

  const sheet = getOrCreateSheet(CONFIG.SHEET_NAME);
  ensureHeaders(sheet);
  const existingIds = getExistingIds(sheet);

  const rows = [
    ...fetchTikTok(existingIds),
    ...fetchInstagram(existingIds),
    ...fetchYouTube(existingIds),
  ];

  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, CONFIG.HEADERS.length)
      .setValues(rows);
    SpreadsheetApp.getUi().alert(`✅ ${rows.length} posts nuevos agregados.`);
  } else {
    SpreadsheetApp.getUi().alert('ℹ️ No hay posts nuevos para agregar.');
  }
}

// ── Triggers ───────────────────────────────────────────────

// Recomendado: 2 veces por semana (lunes y jueves 9am)
// Suficiente para capturar posts nuevos sin desperdiciar compute units
function createWeeklyTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('syncAll')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .inTimezone('America/Argentina/Buenos_Aires')
    .create();
  ScriptApp.newTrigger('syncAll')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.THURSDAY)
    .atHour(9)
    .inTimezone('America/Argentina/Buenos_Aires')
    .create();
  SpreadsheetApp.getUi().alert('✅ Sync 2x semana configurado: lunes y jueves a las 9am AR.\nEsto reduce el uso de Apify un ~85% vs el trigger diario.');
}

// Solo si necesitás datos al día
function createDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('syncAll')
    .timeBased()
    .atHour(9)
    .everyDays(1)
    .inTimezone('America/Argentina/Buenos_Aires')
    .create();
  SpreadsheetApp.getUi().alert('✅ Sync diario configurado: 9am Argentina.');
}

function deleteAllTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  SpreadsheetApp.getUi().alert('✅ Todos los triggers eliminados. El sync solo correrá manualmente.');
}

// ── Apify helpers ──────────────────────────────────────────

function apifyGet(path) {
  const sep = path.includes('?') ? '&' : '?';
  const res = UrlFetchApp.fetch(
    `https://api.apify.com/v2${path}${sep}token=${CONFIG.APIFY_TOKEN}`,
    { muteHttpExceptions: true }
  );
  try { return JSON.parse(res.getContentText()); }
  catch(e) { Logger.log('Apify parse error: ' + res.getContentText().substring(0, 200)); return null; }
}

function getLatestDataset(taskId) {
  const run = apifyGet(`/actor-tasks/${taskId}/runs/last`);
  return run?.data?.defaultDatasetId || null;
}

function getDatasetItems(datasetId) {
  const data = apifyGet(`/datasets/${datasetId}/items?limit=100`);
  return Array.isArray(data) ? data : [];
}

// ── Sheet helpers ──────────────────────────────────────────

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() > 0) return;
  const headerRow = sheet.getRange(1, 1, 1, CONFIG.HEADERS.length);
  headerRow.setValues([CONFIG.HEADERS]);
  headerRow.setFontWeight('bold');
  headerRow.setBackground('#0B1929');
  headerRow.setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);
}

function getExistingIds(sheet) {
  if (sheet.getLastRow() < 2) return new Set();
  const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat();
  return new Set(ids.map(String).filter(Boolean));
}

// ── Row builder ────────────────────────────────────────────

function makeRow(id, platform, url, postedAt, caption, durationSec,
                 views, likes, comments, shares, saves, transcript, hashtags, isPinned) {
  const v  = views    || 0;
  const l  = likes    || 0;
  const c  = comments || 0;
  const sh = shares   || 0;
  const sv = saves    || 0;

  const engRate   = v > 0 ? (l + c + sh + sv) / v : '';
  const saveRate  = v > 0 && saves  != null ? sv / v : '';
  const shareRate = v > 0 && shares != null ? sh / v : '';
  const commRate  = v > 0 ? c / v : '';

  return [
    String(id),
    platform,
    url || '',
    postedAt || '',
    (caption || '').substring(0, 400),        // caption completa para mejor análisis
    durationSec || '',
    views    || '',
    likes    || '',
    comments || '',
    shares   || '',
    saves    || '',
    (transcript || '').substring(0, 3000),    // transcripción completa para análisis de guiones
    engRate,
    saveRate,
    shareRate,
    commRate,
    hashtags || '',
    isPinned || false,
    new Date().toISOString()
  ];
}

// ── Platform fetchers ──────────────────────────────────────

function fetchTikTok(existingIds) {
  const datasetId = getLatestDataset(CONFIG.TASKS.tiktok);
  if (!datasetId) { Logger.log('TikTok: sin dataset'); return []; }

  return getDatasetItems(datasetId)
    .filter(item => item.id && !existingIds.has(String(item.id)))
    .map(item => {
      const hashtags = (item.hashtags || [])
        .map(h => '#' + (h.name || h)).join(', ');
      return makeRow(
        item.id, 'TikTok', item.webVideoUrl,
        item.createTimeISO, item.text,
        item.videoMeta?.duration,
        item.playCount, item.diggCount, item.commentCount,
        item.shareCount, item.collectCount,
        item.transcript || null,
        hashtags, item.isPinned
      );
    });
}

function fetchInstagram(existingIds) {
  const datasetId = getLatestDataset(CONFIG.TASKS.instagram);
  if (!datasetId) { Logger.log('Instagram Reels: sin dataset'); return []; }

  return getDatasetItems(datasetId)
    .filter(item => {
      const id = item.shortCode || item.id;
      return id && !existingIds.has(String(id));
    })
    .map(item => {
      const id = item.shortCode || item.id;
      const hashtags = (item.hashtags || [])
        .map(h => (h.startsWith?.('#') ? h : '#' + h)).join(', ');
      return makeRow(
        id, 'Instagram', item.url,
        item.timestamp, item.caption,
        item.videoDuration || null,
        item.videoViewCount || null,
        item.likesCount, item.commentsCount,
        item.sharesCount || null,
        null,
        item.transcript || item.accessibility_caption || null,
        hashtags, false
      );
    });
}

function parseDuration(s) {
  if (!s || typeof s !== 'string') return null;
  const hms = s.match(/^(?:(\d+):)?(\d+):(\d+)$/);
  if (hms) return (parseInt(hms[1]||0)*3600) + (parseInt(hms[2]||0)*60) + parseInt(hms[3]||0);
  const iso = s.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (iso) return (parseInt(iso[1]||0)*3600) + (parseInt(iso[2]||0)*60) + parseInt(iso[3]||0);
  return null;
}

function fetchYouTube(existingIds) {
  const datasetId = getLatestDataset(CONFIG.TASKS.youtube);
  if (!datasetId) { Logger.log('YouTube: sin dataset'); return []; }

  return getDatasetItems(datasetId)
    .filter(item => item.id && !existingIds.has(String(item.id)))
    .map(item => makeRow(
      item.id, 'YouTube', item.url,
      item.date || item.uploadDate, item.title,
      parseDuration(item.duration),
      item.viewCount, item.likes, item.commentsCount,
      null, null,
      item.transcript || null,
      null, false
    ));
}
