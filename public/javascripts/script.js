document.addEventListener('DOMContentLoaded', () => {
  var elems = document.querySelectorAll('.dropdown-trigger');
  var instances = M.Dropdown.init(elems);
  var modalElems = document.querySelectorAll('.modal');
  var modalInstances = M.Modal.init(modalElems,{});
  console.log('test');

  var i = 0;
  var txt = 'Newsify';
  var speed = 300;
  typeWriter();
  function typeWriter() {
    if (i < txt.length) {
      document.getElementById("newsify-text").innerHTML += txt.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    }
  }
  
}, false);

function toggleBookmark(theCard){
  if($(`#${theCard.id} > i`).hasClass('far')){
  $(`#${theCard.id} > i`).removeClass('far').addClass('fas');
  $(`#${theCard.id}`).css('pointer-events', 'none')
  let fullCard = $(`#card${theCard.id}`);
  let children = fullCard.children();
  let imageDiv = children[0];
  let imageUrl = $(imageDiv).find('img').attr('src');
  let contentDiv = children[1];
  let newsTitle = $(contentDiv).find('h5').html();
  let readMoreDiv = $(`#readmore-modal${theCard.id}`);
  let readMoreContent = readMoreDiv.children();
  readMoreContent = readMoreContent[0];
  let newsDescription = $(readMoreContent).find('p').html();
  let newsAuthor = $(readMoreContent).find('.right-align').find('.author').html();
  let newsDate = $(readMoreContent).find('.right-align').find('.date').html();
  let urlToArticle = $(readMoreContent).find('.center-align').find('a').attr('href');
  console.log(newsAuthor,newsDate,urlToArticle);
  if(newsAuthor == 'undefined'){
    newsAuthor = 'unknown author'
  }
  let article = {
    title: newsTitle,
    description: newsDescription,
    picture: imageUrl,
    author: newsAuthor,
    articleUrl: urlToArticle,
    articleDate: newsDate
  }
  axios.post('/news/create',article)
  .then((response)=>{
    console.log(response);
  })
  .catch((err)=>{
    console.log(err);
  })
  }else{
    $(`#${theCard.id} > i`).removeClass('fas').addClass('far');
    $(`#${theCard.id}`).css('pointer-events', 'none')
  }

  setTimeout(() => {
    $(`#${theCard.id}`).css('pointer-events', 'all')
  }, 1000)

}
