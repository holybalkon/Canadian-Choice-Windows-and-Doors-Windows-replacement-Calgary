// Injects JSON-LD structured data from /data/*.json into <head>.
// Note: needs to be served over http(s); fetch() does not work from file://.
(function () {
  var files = [
    'data/schema-site.json',
    'data/schema-local-business.json',
    'data/schema-faq.json'
  ];
  files.forEach(function (url) {
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var el = document.createElement('script');
        el.type = 'application/ld+json';
        el.textContent = JSON.stringify(data);
        document.head.appendChild(el);
      })
      .catch(function (e) { console.warn('Schema load failed:', url, e); });
  });
})();