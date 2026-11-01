// Site behaviour on top of the template's functions.js
(function ($) {

  // ---- languages -------------------------------------------------------
  // Armenian lives in the markup; remember it so switching back restores it.
  I18N.hy = {
    'mail.subject': 'Հայտ կայքից',
    'mail.name': 'Անուն',
    'mail.phone': 'Հեռախոս',
    'mail.systems': 'Համակարգեր'
  };
  $('[data-i18n]').each(function () { I18N.hy[$(this).data('i18n')] = $(this).text(); });
  $('[data-i18n-html]').each(function () { I18N.hy[$(this).data('i18n-html')] = $(this).html(); });
  $('[data-i18n-value]').each(function () { I18N.hy[$(this).data('i18n-value')] = this.value; });
  $('[data-i18n-content]').each(function () { I18N.hy[$(this).data('i18n-content')] = this.content; });

  var lang = 'hy';
  function t(key) { return I18N[lang][key] || I18N.hy[key] || ''; }

  function setLang(next) {
    if (!I18N[next]) return;
    lang = next;
    document.documentElement.lang = next;
    $('[data-i18n]').each(function () { $(this).text(t($(this).data('i18n'))); });
    $('[data-i18n-html]').each(function () { $(this).html(t($(this).data('i18n-html'))); });
    $('[data-i18n-value]').each(function () { this.value = t($(this).data('i18n-value')); });
    $('[data-i18n-content]').each(function () { this.content = t($(this).data('i18n-content')); });
    $('.lang button').each(function () { this.setAttribute('aria-pressed', this.getAttribute('data-lang') === next); });
    try { localStorage.setItem('lang', next); } catch (e) {}
  }

  $('.lang button').on('click', function () { setLang(this.getAttribute('data-lang')); });

  var saved = null;
  try { saved = new URLSearchParams(location.search).get('lang') || localStorage.getItem('lang'); } catch (e) {}
  if (saved && saved !== 'hy') setLang(saved);

  // ---- navigation ------------------------------------------------------
  // links into the page switch slides through the template's side navigation
  $('[data-go]').on('click', function (e) {
    e.preventDefault();
    $('.side-nav li').eq(+$(this).data('go')).trigger('click');
  });

  // the phone call / order bar steps aside on the order slide itself
  var order = document.getElementById('order');
  function syncBar() { $('.action-bar').toggleClass('is-hidden', order.classList.contains('section--is-active')); }
  new MutationObserver(syncBar).observe(order, { attributes: true, attributeFilter: ['class'] });

  // keyboard access for the template's div buttons
  $('[role="button"]').on('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $(this).trigger('click'); }
  });

  // ---- order form ------------------------------------------------------
  // The site is static: the request opens the visitor's mail app with everything filled in.
  $('.work-request').on('submit', function (e) {
    e.preventDefault();
    var systems = $(this).find('input[type="checkbox"]:checked').map(function () { return t(this.value); }).get();
    var body = t('mail.name') + ': ' + $('#name').val() + '\n' +
               t('mail.phone') + ': ' + $('#phone').val() + '\n' +
               t('mail.systems') + ': ' + (systems.join(', ') || '—');
    location.href = 'mailto:info@securitysector.am?subject=' + encodeURIComponent(t('mail.subject')) +
                    '&body=' + encodeURIComponent(body);
  });
})(jQuery);
