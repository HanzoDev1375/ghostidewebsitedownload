/* ==========================================================================
   Ghost IDE download site — app logic
   GitHub API + i18n (fa/en) + rendering + GSAP choreography
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* config                                                              */
  /* ------------------------------------------------------------------ */

  var OWNER = 'HanzoDev1375';
  var REPO = 'GhostIdes';
  var API_BASE = 'https://api.github.com/repos/' + OWNER + '/' + REPO;
  var CACHE_KEY = 'ghostide-dl-cache-v1';
  var CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  var LANG_KEY = 'ghostide-dl-lang';

  /* ------------------------------------------------------------------ */
  /* i18n                                                                */
  /* ------------------------------------------------------------------ */

  var I18N = {
    fa: {
      brandSub: 'دانلود',
      openSource: 'متن‌باز · GPLv3 · ساخته‌شده برای اندروید',
      heroTitle1: 'کد بزن',
      heroTitleEm: 'همین‌جا',
      heroTitle2: '، روی گوشی خودت.',
      lead: 'Ghost IDE یک محیط توسعه‌ی کامل روی اندروید است؛ ویرایشگر سریع با LSP، اجرای کد با Debian، دستیار هوش مصنوعی و سیستم پلاگین .gpl — همه در یک اپ.',
      downloadLatest: 'دانلود آخرین نسخه',
      allReleases: 'همه‌ی ریلیزها',
      statVersion: 'آخرین نسخه',
      statDownloads: 'کل دانلودها',
      statStars: 'ستاره‌ها',
      statSize: 'حجم نصب',
      featuresTitle: 'چرا Ghost IDE؟',
      releasesTitle: 'ریلیزها',
      releasesDek: 'این لیست مستقیم از GitHub API خوانده می‌شود — هر ریلیز جدیدی که منتشر کنی همین‌جا خودکار ظاهر می‌شود.',
      installTitle: 'نصب',
      footDocs: 'مستندات پلاگین',
      badgeLatest: 'جدیدترین',
      badgePre: 'پیش‌نمایش',
      downloadApk: 'دانلود APK',
      viewOnGithub: 'گیت‌هاب',
      notesLabel: 'یادداشت‌های انتشار',
      assetsLabel: 'فایل‌ها',
      errTitle: 'خطا در دریافت اطلاعات از گیت‌هاب',
      errRate: 'احتمالاً سقف درخواست‌های API موقتاً پر شده. چند دقیقه بعد دوباره بررسی کن یا مستقیم از',
      errHere: 'صفحه‌ی ریلیزها',
      errGet: 'دانلود کن.',
      loadingMeta: 'در حال دریافت اطلاعات نسخه…',
      rateLimitMeta: 'سقف درخواست API پر شده — از صفحه‌ی ریلیزهای گیت‌هاب دانلود کن.',
      downloads: 'دانلود',
      steps: [
        { t: '<b>دانلود APK</b> — روی دکمه‌ی «دانلود آخرین نسخه» بزن تا آخرین ریلیز مستقیم از گیت‌هاب دانلود شود.' },
        { t: '<b>اجازه‌ی نصب</b> — چون اپ خارج از استور است، اندروید اجازه‌ی «نصب از منابع ناشناس» را برای مرورگرت می‌خواهد؛ تأییدش کن.' },
        { t: '<b>نصب</b> — فایل دانلودشده را باز کن و Install را بزن.' },
        { t: '<b>اولین اجرا</b> — پروژه‌ات را باز یا بساز؛ LSP و هایلایت خودکار فعال می‌شوند.' }
      ],
      features: [
        { icon: 'code', t: 'ویرایشگر سریع', d: 'چند تب، ذخیره خودکار، اسنیپت و مدیریت فایل‌های حجیم با صفحه‌بندی؛ تم و پس‌زمینه‌ی دلخواه.' },
        { icon: 'plug', t: 'LSP', d: 'تکمیل خودکار، فرمت کد و پیشنهادهای زنده با سرویس Language Server.' },
        { icon: 'globe', t: '۲۵+ زبان', d: 'هایلایت سینتکس از Java ،Kotlin ،Python و Go تا Rust ،Lua ،Vue و TSX/JSX.' },
        { icon: 'build', t: 'اجرای کد', d: 'کامپایلر و ران‌تایم Debian روی دستگاه؛ C ،++C ،Python ،PHP ،Node.js ،TypeScript ،Go و Lua.' },
        { icon: 'bot', t: 'دستیار AI', d: 'چت هوش مصنوعی داخل IDE با تاریخچه‌ی گفتگو و پیوست کردن فایل به پرسش‌ها.' },
        { icon: 'terminal', t: 'ترمینال Debian', d: 'ترمینال لینوکس درون‌برنامه‌ای با مدیریت بسته؛ به‌همراه Git داخلی برای پروژه‌ها.' },
        { icon: 'net', t: 'FTP / SFTP / SMB', d: 'اتصال به سرورها و فضاهای شبکه‌ای و کار مستقیم روی فایل‌های ریموت.' },
        { icon: 'package', t: 'پلاگین .gpl', d: 'گسترش IDE با پلاگین‌های بسته‌بندی‌شده و API ماژولار (plugin-api / ide-api).' },
        { icon: 'shield', t: 'متن‌باز GPLv3', d: 'سورس کامل عمومی است و هر ریلیز همراه با امضای SHA-256 منتشر می‌شود.' }
      ]
    },
    en: {
      brandSub: 'Download',
      openSource: 'Open source · GPLv3 · Built for Android',
      heroTitle1: 'Code right',
      heroTitleEm: 'here',
      heroTitle2: ', on your phone.',
      lead: 'Ghost IDE is a complete development environment on Android: a fast editor with LSP, on-device code running via Debian, a built-in AI assistant and the .gpl plugin system — all in one app.',
      downloadLatest: 'Download latest',
      allReleases: 'All releases',
      statVersion: 'Latest version',
      statDownloads: 'Total downloads',
      statStars: 'Stars',
      statSize: 'Install size',
      featuresTitle: 'Why Ghost IDE?',
      releasesTitle: 'Releases',
      releasesDek: 'This list is read live from the GitHub API — every new release you publish shows up here automatically.',
      installTitle: 'Installation',
      footDocs: 'Plugin docs',
      badgeLatest: 'Latest',
      badgePre: 'Pre-release',
      downloadApk: 'Download APK',
      viewOnGithub: 'GitHub',
      notesLabel: 'Release notes',
      assetsLabel: 'Files',
      errTitle: 'Failed to load data from GitHub',
      errRate: 'The API rate limit may be exhausted. Try again in a few minutes, or download directly from the',
      errHere: 'releases page',
      errGet: '.',
      loadingMeta: 'Fetching release info…',
      rateLimitMeta: 'API rate limit reached — grab it from the GitHub releases page.',
      downloads: 'downloads',
      steps: [
        { t: '<b>Download the APK</b> — hit “Download latest” and the newest release comes straight from GitHub.' },
        { t: '<b>Allow installs</b> — Android will ask for “install unknown apps” permission for your browser; approve it.' },
        { t: '<b>Install</b> — open the downloaded file and tap Install.' },
        { t: '<b>First run</b> — open or create a project; LSP and highlighting turn on automatically.' }
      ],
      features: [
        { icon: 'code', t: 'Fast editor', d: 'Multi-tab, auto-save, snippets and paged handling of large files; custom themes & backgrounds.' },
        { icon: 'plug', t: 'LSP', d: 'Autocomplete, code formatting and live suggestions via the Language Server service.' },
        { icon: 'globe', t: '25+ languages', d: 'Syntax highlighting from Java, Kotlin, Python and Go to Rust, Lua, Vue and TSX/JSX.' },
        { icon: 'build', t: 'Code runner', d: 'Debian compiler & runtime on device — C, C++, Python, PHP, Node.js, TypeScript, Go and Lua.' },
        { icon: 'bot', t: 'AI assistant', d: 'In-IDE AI chat with conversation history and file attachments for your questions.' },
        { icon: 'terminal', t: 'Debian terminal', d: 'Full in-app Linux terminal with package management, plus built-in Git for projects.' },
        { icon: 'net', t: 'FTP / SFTP / SMB', d: 'Connect to remote servers and network shares and work on files directly.' },
        { icon: 'package', t: '.gpl plugins', d: 'Extend the IDE with packaged plugins and the modular plugin-api / ide-api libraries.' },
        { icon: 'shield', t: 'Open source GPLv3', d: 'Full public source; every release is published with a SHA-256 digest.' }
      ]
    }
  };

  /* ------------------------------------------------------------------ */
  /* icons                                                               */
  /* ------------------------------------------------------------------ */

  var ICONS = {
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"/><path d="M14 4h6v6"/><path d="M20 4 10.5 13.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12.5 9.5 18 20 6"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M5.5 15.5h-1a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    terminal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><polyline points="7.5 10 11 13 7.5 16"/><line x1="12.5" y1="16" x2="16.5" y2="16"/></svg>',
    plug: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3v5"/><path d="M15 3v5"/><path d="M6.5 8h11v3a5.5 5.5 0 0 1-5.5 5.5A5.5 5.5 0 0 1 6.5 11Z"/><path d="M12 16.5V21"/></svg>',
    package: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7.5 12 4l8 3.5-8 3.5-8-3.5Z"/><path d="M4 7.5v9l8 3.5 8-3.5v-9"/><line x1="12" y1="11" x2="12" y2="20"/></svg>',
    build: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18v3h3l5.7-5.7a4.5 4.5 0 0 0 6-6L15 12l-3-3 2.7-2.7Z"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 8 4.5 12 9 16"/><polyline points="15 8 19.5 12 15 16"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 20 6v6c0 4.6-3.2 7.9-8 9-4.8-1.1-8-4.4-8-9V6Z"/><polyline points="8.8 12 11 14.2 15.5 9.7"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14.5 14.5 0 0 1 0 18a14.5 14.5 0 0 1 0-18"/></svg>',
    bot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4"/><circle cx="12" cy="3" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="13.5" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="13.5" r="1" fill="currentColor" stroke="none"/><path d="M9.5 17h5"/></svg>',
    net: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 0 0 .42-8.98 7 7 0 0 0-13.36 2.2A4 4 0 0 0 6 19.9h11.5"/><path d="M12 12v6"/><path d="m9.5 15.5 2.5-2.5 2.5 2.5"/></svg>'
  };

  /* ------------------------------------------------------------------ */
  /* state                                                               */
  /* ------------------------------------------------------------------ */

  var state = {
    lang: 'fa',
    repo: null,
    releases: null,
    loadError: false
  };

  /* ------------------------------------------------------------------ */
  /* utils                                                               */
  /* ------------------------------------------------------------------ */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtLocale() {
    return state.lang === 'fa' ? 'fa-IR' : 'en-US';
  }
  function fmtNum(n) {
    try { return new Intl.NumberFormat(fmtLocale()).format(n); }
    catch (e) { return String(n); }
  }
  function fmtDate(iso) {
    try {
      return new Intl.DateTimeFormat(fmtLocale(), { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso));
    } catch (e) { return iso.slice(0, 10); }
  }
  function fmtSize(bytes) {
    var mb = bytes / 1048576;
    return (mb >= 100 ? Math.round(mb) : mb.toFixed(1)) + ' MB';
  }

  /* minimal markdown -> html (input is escaped first, patterns applied after) */
  function mdLite(src) {
    var lines = escapeHtml(src).split(/\r?\n/);
    var out = [];
    var inList = false;
    var inCode = false;
    var codeBuf = [];

    function flushList() { if (inList) { out.push('</ul>'); inList = false; } }
    function inline(s) {
      s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
      s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, function (m, t, u) {
        return '<a href="' + u + '" target="_blank" rel="noopener">' + t + '</a>';
      });
      return s;
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (/^```/.test(line.trim())) {
        if (inCode) { out.push('<pre><code>' + codeBuf.join('\n') + '</code></pre>'); codeBuf = []; inCode = false; }
        else { flushList(); inCode = true; }
        continue;
      }
      if (inCode) { codeBuf.push(line); continue; }
      var m;
      if ((m = line.match(/^#{1,4}\s+(.*)$/))) { flushList(); out.push('<h4>' + inline(m[1]) + '</h4>'); continue; }
      if ((m = line.match(/^\s*[-*+]\s+(.*)$/))) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push('<li>' + inline(m[1]) + '</li>');
        continue;
      }
      flushList();
      if (line.trim() === '') continue;
      out.push('<p>' + inline(line) + '</p>');
    }
    if (inCode && codeBuf.length) out.push('<pre><code>' + codeBuf.join('\n') + '</code></pre>');
    flushList();
    return out.join('');
  }

  /* ------------------------------------------------------------------ */
  /* github api                                                          */
  /* ------------------------------------------------------------------ */

  function readCache() {
    try {
      var raw = safeGet(CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function writeCache(repo, releases) {
    safeSet(CACHE_KEY, JSON.stringify({ t: Date.now(), repo: repo, releases: releases }));
  }

  function fetchJson(url) {
    return fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      });
  }

  function loadData(force) {
    var cached = readCache();
    if (!force && cached && (Date.now() - cached.t) < CACHE_TTL) {
      applyData(cached.repo, cached.releases);
      return;
    }
    Promise.all([
      fetchJson(API_BASE),
      fetchJson(API_BASE + '/releases?per_page=30')
    ]).then(function (r) {
      writeCache(r[0], r[1]);
      applyData(r[0], r[1]);
    }).catch(function () {
      if (cached) { applyData(cached.repo, cached.releases); return; }
      state.loadError = true;
      renderTimeline();
      var meta = $('#dlMeta');
      if (meta) meta.textContent = T().rateLimitMeta;
      var pill = $('#verPill');
      if (pill) { pill.classList.remove('is-live'); pill.innerHTML = '—'; }
    });
  }

  function findApk(release) {
    if (!release || !release.assets) return null;
    for (var i = 0; i < release.assets.length; i++) {
      var a = release.assets[i];
      if (a.state === 'uploaded' && /\.apk$/i.test(a.name)) return a;
    }
    return null;
  }

  function applyData(repo, releases) {
    state.repo = repo;
    state.releases = releases;
    state.loadError = false;

    var latest = releases && releases.length ? releases[0] : null;
    var apk = findApk(latest);

    /* hero card */
    var pill = $('#verPill');
    pill.classList.remove('is-live'); // removes spinner state
    pill.innerHTML = '';
    pill.textContent = latest ? 'v' + latest.tag_name : '—';
    if (latest && latest.prerelease) pill.style.color = 'var(--amber)';
    if (latest) pill.classList.add('is-live');

    var btnDl = $('#btnDl');
    if (apk) btnDl.href = apk.browser_download_url;
    else if (latest) btnDl.href = latest.html_url;

    var bits = [];
    if (apk) bits.push(fmtSize(apk.size));
    if (latest) {
      bits.push(fmtDate(latest.published_at));
      if (apk) bits.push(fmtNum(apk.download_count) + ' ' + T().downloads);
    }
    $('#dlMeta').textContent = bits.join(' · ') || '\u00a0';

    /* sha row */
    if (apk && apk.digest) {
      var sha = String(apk.digest).replace(/^sha256:/i, '');
      $('#shaText').textContent = 'SHA-256 · ' + sha;
      $('#shaRow').hidden = false;
      $('#shaCopy').onclick = function () {
        var done = function () {
          $('#shaCopy').innerHTML = ICONS.check;
          setTimeout(function () { $('#shaCopy').innerHTML = ICONS.copy; }, 1300);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(sha).then(done, done);
        } else done();
      };
    }

    /* stats */
    var totalDl = 0;
    (releases || []).forEach(function (r) {
      (r.assets || []).forEach(function (a) { totalDl += a.download_count || 0; });
    });

    tweenStat('[data-stat="version"]', latest ? latest.tag_name : '—', null);
    tweenStat('[data-stat="downloads"]', totalDl, 'int');
    tweenStat('[data-stat="stars"]', repo ? repo.stargazers_count : 0, 'int');
    tweenStat('[data-stat="size"]', apk ? apk.size / 1048576 : 0, 'mb');

    renderTimeline();
  }

  /* animated counter (gsap if available, otherwise direct set) */
  function tweenStat(sel, target, mode) {
    var el = $(sel);
    if (!el) return;
    var fmt = function (v) {
      if (mode === 'int') return fmtNum(Math.round(v));
      if (mode === 'mb') return v.toFixed(1) + ' MB';
      return String(v);
    };
    if (!window.gsap || mode == null) { el.textContent = fmt(target); return; }
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.1,
      ease: 'power2.out',
      onUpdate: function () { el.textContent = fmt(obj.v); }
    });
  }

  /* ------------------------------------------------------------------ */
  /* static sections                                                     */
  /* ------------------------------------------------------------------ */

  function T() { return I18N[state.lang]; }

  function renderFeatures() {
    var f = T().features;
    $('#featGrid').innerHTML = f.map(function (it) {
      return '<div class="featcard">' +
        '<div class="featcard__icon">' + (ICONS[it.icon] || '') + '</div>' +
        '<h3>' + escapeHtml(it.t) + '</h3>' +
        '<p>' + escapeHtml(it.d) + '</p></div>';
    }).join('');
  }

  function renderSteps() {
    var s = T().steps;
    $('#stepsList').innerHTML = s.map(function (it) {
      return '<li><span>' + it.t + '</span></li>';
    }).join('');
  }

  /* ------------------------------------------------------------------ */
  /* releases timeline                                                   */
  /* ------------------------------------------------------------------ */

  function renderTimeline() {
    var box = $('#timeline');

    if (state.loadError) {
      box.innerHTML = '<div class="note"><div><b>' + escapeHtml(T().errTitle) + '</b> — ' +
        escapeHtml(T().errRate) + ' <a href="https://github.com/' + OWNER + '/' + REPO + '/releases" target="_blank" rel="noopener">' +
        escapeHtml(T().errHere) + '</a>' + escapeHtml(T().errGet) + '</div></div>';
      return;
    }

    if (!state.releases) return; // still loading -> skeleton stays

    box.innerHTML = state.releases.map(function (r, idx) {
      var apk = findApk(r);
      var otherAssets = (r.assets || []).filter(function (a) { return !/\.apk$/i.test(a.name); });
      var dlSum = (r.assets || []).reduce(function (s, a) { return s + (a.download_count || 0); }, 0);

      var badges = '';
      if (idx === 0) badges += '<span class="badge-latest">' + escapeHtml(T().badgeLatest) + '</span>';
      if (r.prerelease) badges += '<span class="badge-pre">' + escapeHtml(T().badgePre) + '</span>';

      var actions = '';
      if (apk) {
        actions += '<a class="btn ' + (idx === 0 ? 'btn-primary' : 'btn-ghost') + '" href="' + escapeHtml(apk.browser_download_url) + '">' +
          escapeHtml(T().downloadApk) + ' · ' + fmtSize(apk.size) + '</a>';
      }
      actions += '<a class="rel__gh" href="' + escapeHtml(r.html_url) + '" target="_blank" rel="noopener">' +
        ICONS.external + escapeHtml(T().viewOnGithub) + '</a>';

      var extras = '';
      var detailParts = [];
      if (r.body && r.body.trim()) {
        detailParts.push('<div class="relnotes">' + mdLite(r.body) + '</div>');
      }
      if (otherAssets.length) {
        detailParts.push('<div class="relassets">' + otherAssets.map(function (a) {
          return '<a class="relasset" href="' + escapeHtml(a.browser_download_url) + '">' +
            escapeHtml(a.name) + '<span class="sz">' + fmtSize(a.size) + '</span></a>';
        }).join('') + '</div>');
      }
      if (detailParts.length) {
        extras = '<details class="reldetails"' + (idx === 0 ? ' open' : '') + '><summary>' +
          escapeHtml(T().notesLabel) + ' / ' + escapeHtml(T().assetsLabel) + ' (' + fmtNum(otherAssets.length) + ')</summary>' +
          detailParts.join('') + '</details>';
      }

      return '<article class="rel' + (idx === 0 ? ' is-latest' : '') + '">' +
        '<div class="rel__top"><span class="rel__tag">v' + escapeHtml(r.tag_name) + '</span>' + badges +
        '<span class="rel__date">' + escapeHtml(fmtDate(r.published_at)) + '</span></div>' +
        '<div class="rel__meta">' + fmtNum(dlSum) + ' ' + escapeHtml(T().downloads) + '</div>' +
        '<div class="rel__actions">' + actions + '</div>' +
        extras +
        '</article>';
    }).join('');
  }

  /* ------------------------------------------------------------------ */
  /* language                                                            */
  /* ------------------------------------------------------------------ */

  function applyI18nStatic() {
    $$('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (T()[key] != null) el.textContent = T()[key];
    });
  }

  function renderAll() {
    document.documentElement.setAttribute('lang', state.lang);
    document.documentElement.setAttribute('dir', state.lang === 'fa' ? 'rtl' : 'ltr');
    document.body.setAttribute('dir', state.lang === 'fa' ? 'rtl' : 'ltr');
    $('#langFa').classList.toggle('is-active', state.lang === 'fa');
    $('#langEn').classList.toggle('is-active', state.lang === 'en');
    document.title = 'Ghost IDE — ' + (state.lang === 'fa' ? 'دانلود' : 'Download');

    // let heroIntro re-split & replay the title after the text swap
    var h1 = $('#heroTitle');
    if (h1) h1.removeAttribute('data-split');

    applyI18nStatic();
    renderFeatures();
    renderSteps();
    renderTimeline();

    if (state.releases) applyData(state.repo, state.releases);
    else $('#dlMeta').textContent = state.loadError ? T().rateLimitMeta : T().loadingMeta;

    observeReveals();
  }

  var switching = false;

  function setLang(lang) {
    if (state.lang === lang || switching) return;
    switching = true;
    state.lang = lang;
    safeSet(LANG_KEY, lang);

    var mainEl = $('#mainContent');
    var finish = function () { switching = false; };

    // micro bounce on the pressed pill
    var btn = $(lang === 'fa' ? '#langFa' : '#langEn');
    if (window.gsap && btn) {
      gsap.fromTo(btn, { scale: 0.8 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' });
    }

    function swap() {
      renderAll();
      heroIntro(); // replay word-stagger entrance with the new language
      if (!window.gsap || !mainEl) { finish(); return; }
      gsap.fromTo(mainEl,
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out', onComplete: finish });
    }

    if (window.gsap && mainEl) {
      gsap.to(mainEl, {
        y: -16, autoAlpha: 0, duration: 0.22, ease: 'power2.in',
        onComplete: swap
      });
    } else if (mainEl) {
      mainEl.style.transition = 'opacity .18s ease';
      mainEl.style.opacity = '0';
      setTimeout(function () {
        swap();
        mainEl.style.transition = 'opacity .3s ease';
        mainEl.style.opacity = '1';
        finish();
      }, 190);
    } else {
      swap();
    }
  }

  /* ------------------------------------------------------------------ */
  /* reveal-on-scroll                                                    */
  /* ------------------------------------------------------------------ */

  var io = null;

  function observeReveals() {
    $$('.features, .releases, .install').forEach(function (sec) {
      sec.classList.add('reveal');
      $$('.featgrid, .steps', sec).forEach(function (grid) { grid.classList.add('stagger'); });
    });
    if (io) { io.disconnect(); }
    if (!('IntersectionObserver' in window)) {
      $$('.reveal, .stagger').forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal, .stagger').forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  /* GSAP hero intro                                                     */
  /* ------------------------------------------------------------------ */

  function splitWords(root) {
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement('span'); w.className = 'w';
            var wi = document.createElement('span'); wi.className = 'wi';
            wi.textContent = part;
            w.appendChild(wi);
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    }
    walk(root);
  }

  function heroIntro() {
    if (!window.gsap) return;
    var h1 = $('#heroTitle');
    if (!h1 || h1.dataset.split) return;
    h1.dataset.split = '1';
    splitWords(h1);

    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero__eyebrow', { y: -16, autoAlpha: 0, duration: 0.5 }, 0.05)
      .from('#heroTitle .wi', { yPercent: 118, duration: 0.75, stagger: 0.06, ease: 'power4.out' }, 0.15)
      .from('.hero .lead', { y: 18, autoAlpha: 0, duration: 0.55 }, 0.5)
      .from('#dlcard', { y: 30, autoAlpha: 0, scale: 0.96, duration: 0.7, ease: 'power4.out' }, 0.62)
      .from('#stats .stat', { y: 20, autoAlpha: 0, duration: 0.5, stagger: 0.08 }, 0.78);
  }

  /* ------------------------------------------------------------------ */
  /* init                                                                */
  /* ------------------------------------------------------------------ */

  function init() {
    var saved = safeGet(LANG_KEY);
    if (saved === 'en' || saved === 'fa') state.lang = saved;

    var nav = (navigator.language || '').toLowerCase();
    if (!saved && nav.indexOf('fa') !== 0) state.lang = 'en';

    $('#langFa').addEventListener('click', function () { setLang('fa'); });
    $('#langEn').addEventListener('click', function () { setLang('en'); });
    $('#year').textContent = new Date().getFullYear();

    $('#dlMeta').textContent = T().loadingMeta;

    renderAll();
    heroIntro();
    loadData(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
