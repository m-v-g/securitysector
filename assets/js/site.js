// Site behaviour on top of the template's functions.js
(function ($) {
  var phone = window.matchMedia('(max-width: 767px)');
  var $sections = $('.main-content > li');

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
  // On phones the slides become one scrolling page, so menu items scroll instead.
  function scrollTo(index, delay) {
    setTimeout(function () {
      var top = $sections.eq(index).offset().top - $('.header').outerHeight();
      window.scrollTo({ top: index === 0 ? 0 : top, behavior: 'smooth' });
    }, delay || 0);
  }

  $('[data-go]').on('click', function (e) {
    e.preventDefault();
    var index = +$(this).data('go');
    if (phone.matches) scrollTo(index);
    else $('.side-nav li').eq(index).trigger('click');
  });

  $('.outer-nav li').on('click', function () {
    if (phone.matches) scrollTo($(this).index(), 450);
  });

  $('.cta').on('click', function () {
    if (phone.matches) scrollTo($sections.length - 1);
  });

  // the phone call / order bar steps aside once the order form itself is on screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      $('.action-bar').toggleClass('is-hidden', entries[0].isIntersecting);
    }, { threshold: 0.25 }).observe(document.getElementById('order'));
  }

  // keep the template's wheel and arrow-key slide switching away from the scrolling phone page
  ['mousewheel', 'DOMMouseScroll', 'keyup'].forEach(function (type) {
    window.addEventListener(type, function (e) { if (phone.matches) e.stopPropagation(); }, true);
  });

  // keyboard access for the template's div buttons
  $('[role="button"]').on('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $(this).trigger('click'); }
  });

  // ---- order form ------------------------------------------------------
  // the template's handler also jumped to the top of the page, which breaks the phone layout
  $('.work-request--information input').off('focusout').on('focusout', function () {
    $(this).toggleClass('has-value', this.value !== '');
  });

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
