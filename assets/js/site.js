// Site behaviour on top of the template's functions.js
(function ($) {

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
  // The page is one long scroll; every menu item, numbered dot and order button scrolls to its section.
  var last = $sections.length - 1;

  function scrollTo(index) {
    var top = index === 0 ? 0 : $sections.eq(index).offset().top - $('.header').outerHeight();
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  function setMenu(open) {
    $('body').toggleClass('menu-open', open);
    $('.outer-nav, .outer-nav li').toggleClass('is-vis', open);
    $('.header--nav-toggle').attr('aria-expanded', open);
  }

  $('.header--nav-toggle').on('click', function () { setMenu(!$('body').hasClass('menu-open')); });
  $(document).on('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  $('[data-go]').on('click', function (e) {
    e.preventDefault();
    scrollTo(+$(this).data('go'));
  });

  $('.side-nav li').on('click', function () { scrollTo($(this).index()); });

  $('.outer-nav li').on('click', function () {
    setMenu(false);
    scrollTo($(this).index());
  });

  $('.cta').on('click', function () { scrollTo(last); });

  // highlight the section in view; the header order button shows between the first and last sections
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var index = $sections.index(entry.target);
        $('.side-nav, .outer-nav').children().removeClass('is-active');
        $('.side-nav').children().eq(index).addClass('is-active');
        $('.outer-nav').children().eq(index).addClass('is-active');
        $('.header--cta').toggleClass('is-active', index !== 0 && index !== last);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $sections.each(function () { spy.observe(this); });

    // the phone call / order bar steps aside once the order form itself is on screen
    new IntersectionObserver(function (entries) {
      $('.action-bar').toggleClass('is-hidden', entries[0].isIntersecting);
    }, { threshold: 0.25 }).observe(document.getElementById('order'));
  }

  // keyboard access for div buttons
  $('[role="button"]').on('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $(this).trigger('click'); }
  });

  // ---- brands slider ---------------------------------------------------
  // three visible circles: left, center, right; the arrows rotate them through all brands
  var $items = $('.slider--item');

  function showBrand(center) {
    var n = $items.length;
    center = (center + n) % n;
    $items.removeClass('slider--item-left slider--item-center slider--item-right');
    $items.eq((center - 1 + n) % n).addClass('slider--item-left');
    $items.eq(center).addClass('slider--item-center');
    $items.eq((center + 1) % n).addClass('slider--item-right');
  }

  $('.slider--prev, .slider--next').on('click', function () {
    var step = $(this).hasClass('slider--next') ? 1 : -1;
    var center = $items.index($items.filter('.slider--item-center'));
    $('.slider').stop().animate({ opacity: 0 }, 300, function () {
      showBrand(center + step);
      $('.slider').animate({ opacity: 1 }, 300);
    });
  });

  // ---- order form ------------------------------------------------------
  // keep the label above a filled field
  $('.work-request--information input').on('focusout', function () {
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
